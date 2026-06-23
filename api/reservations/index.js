const { supabaseAdmin } = require('../_lib/supabase');
const {
  validateRequired,
  isValidEmail,
  isFutureDate,
  isDateWithinMaxAdvance,
  isValidType,
  isValidTime,
  isLoungeOpenOnDate,
  isValidPhone,
  checkMaxLengths,
  sanitize,
  VALID_TYPES,
} = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');
const { sendReservationReceivedEmail, sendAdminReservationNotification } = require('../_lib/email');
const { verifyCaptcha } = require('../_lib/captcha');

/**
 * POST /api/reservations
 *
 * Customer creates a new reservation.
 * Validates all inputs, verifies CAPTCHA, checks for duplicates,
 * saves to Supabase, sends confirmation email + admin notification.
 *
 * Execution order (matches §8.1 of reservations-guidelines.md):
 *   1. CORS preflight
 *   2. Method check
 *   3. Rate limiting
 *   4. CAPTCHA verification
 *   5. Required fields check
 *   6. Type validation
 *   7. Max-length enforcement
 *   8. Field-level validation (name, email, phone, date, time, guests, message)
 *   9. Lounge day-of-week check (Tuesdays closed)
 *  10. Duplicate guard (same email + date + time within 5 min)
 *  11. Insert to Supabase
 *  12. Send emails (non-blocking — failures never block the save)
 *  13. Return 201 with reservation summary
 */
module.exports = async (req, res) => {
  // ── 1. CORS preflight ──
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── 2. Method check ──
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 3. Rate limiting ──
  const ip = getClientIp(req);
  const { allowed, remaining, retryAfterMs } = await checkRateLimit(ip, '/api/reservations');
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many reservation requests. Please try again later.',
      retryAfterMs,
    });
  }

  // ── 4. CAPTCHA verification ──
  const { captcha_token } = req.body || {};
  const captchaOk = await verifyCaptcha(captcha_token);
  if (!captchaOk) {
    return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
  }

  // ── 5. Required fields check ──
  const { valid, missing } = validateRequired(req.body, ['type', 'name', 'email', 'date', 'time', 'guest_count']);
  if (!valid) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const { type, name, email, phone, date, time, guest_count, message } = req.body;

  // ── 6. Type validation ──
  // Allowed types: 'table', 'event', 'lounge' (matches DB CHECK constraint)
  if (!isValidType(type)) {
    return res.status(400).json({ error: `Invalid reservation type. Must be one of: ${VALID_TYPES.join(', ')}` });
  }

  // ── 7. Max-length enforcement (server-side, not just client) ──
  const tooLong = checkMaxLengths(req.body, {
    name: 100,
    email: 254,
    phone: 20,
    message: 500,
  });
  if (tooLong) {
    return res.status(400).json({ error: `${tooLong.field} must not exceed ${tooLong.max} characters.` });
  }

  // ── 8. Field-level validation ──

  // Name: must be >= 2 chars after trim (catches spaces-only like "   ")
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }

  // Email: format check
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Phone: optional, but if provided must match format
  if (phone && phone.trim() && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number. Use digits, spaces, +, -, () only.' });
  }

  // Date: must be a future date in JST (no same-day bookings)
  if (!isFutureDate(date)) {
    return res.status(400).json({ error: 'Reservation date must be in the future (same-day bookings are not available).' });
  }

  // Date: max 6 months in advance
  if (!isDateWithinMaxAdvance(date, 180)) {
    return res.status(400).json({ error: 'Reservations cannot be made more than 6 months in advance.' });
  }

  // Time: must be valid HH:MM AND within business hours for the type
  //   - table/event (resto•bar): 09:00–17:00 JST
  //   - lounge: 19:00–02:00 JST
  if (!isValidTime(time, type)) {
    const hoursMsg = type === 'lounge'
      ? '7:00 PM and 2:00 AM (JST)'
      : '9:00 AM and 5:00 PM (JST)';
    return res.status(400).json({ error: `Please select a time between ${hoursMsg}.` });
  }

  // Guest count: must be 1–500 (physical lounge cap of 20 is managed by admin)
  const guestCount = parseInt(guest_count, 10);
  if (isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ error: 'Guest count must be at least 1.' });
  }
  if (guestCount > 500) {
    return res.status(400).json({ error: 'Guest count cannot exceed 500.' });
  }

  // Message: optional, max 500 chars (already checked in max-length step)

  // ── 9. Lounge day-of-week check ──
  // The lounge is closed on Tuesdays
  if (type === 'lounge') {
    const loungeCheck = isLoungeOpenOnDate(date);
    if (!loungeCheck.open) {
      return res.status(400).json({ error: loungeCheck.reason });
    }
  }

  // ── 10–13. Insert + emails (wrapped in try/catch) ──
  try {
    // ── 10. Duplicate guard ──
    // Prevent same email + date + time within a 5-minute window (network retry / double-submit)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: duplicate } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('email', sanitize(email))
      .eq('date', date)
      .eq('time', time)
      .gte('created_at', fiveMinutesAgo)
      .maybeSingle();

    if (duplicate) {
      return res.status(409).json({ error: 'A reservation with these details was already submitted recently.' });
    }

    // ── 11. Insert reservation ──
    const reservation = {
      type: sanitize(type),
      name: sanitize(name),
      email: sanitize(email),
      phone: phone && phone.trim() ? sanitize(phone) : null,
      date,
      time,
      guest_count: guestCount,
      message: message && message.trim() ? sanitize(message) : null,
      status: 'pending',
      ip_address: ip,
    };

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert(reservation)
      .select()
      .single();

    if (error) {
      console.error('Reservation insert error:', error);
      return res.status(500).json({ error: 'Failed to save reservation. Please try again.' });
    }

    // ── 12. Send emails (non-blocking — failures NEVER prevent the reservation save) ──

    // Customer confirmation email
    try {
      const emailResult = await sendReservationReceivedEmail(email, data);
      if (emailResult.success) {
        // Mark that we sent the confirmation email (best-effort, don't fail if this update fails)
        await supabaseAdmin
          .from('reservations')
          .update({ email_confirmed_sent: true })
          .eq('id', data.id);
      }
    } catch (emailErr) {
      console.error('Customer email failed (reservation still saved):', emailErr);
    }

    // Admin notification (fire-and-forget)
    sendAdminReservationNotification(data).catch((err) => {
      console.error('Admin notification failed:', err);
    });

    // ── 13. Return success ──
    return res.status(201).json({
      message: 'Reservation submitted successfully. You will receive a confirmation email shortly.',
      reservation: {
        id: data.id,
        type: data.type,
        date: data.date,
        time: data.time,
        guest_count: data.guest_count,
        status: data.status,
      },
      remaining,
    });
  } catch (err) {
    console.error('Reservation exception:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};
