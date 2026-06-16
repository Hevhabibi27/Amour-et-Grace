const { supabaseAdmin } = require('../_lib/supabase');
const { validateRequired, isValidEmail, isFutureDate, sanitize } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');
const { sendReservationReceivedEmail, sendAdminReservationNotification } = require('../_lib/email');

/**
 * POST /api/reservations
 * Customer creates a new reservation.
 * Sends a "received" email to the customer + notifies admin.
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const { allowed, remaining, retryAfterMs } = await checkRateLimit(ip, '/api/reservations');
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many reservation requests. Please try again later.',
      retryAfterMs,
    });
  }

  // Validate required fields
  const { valid, missing } = validateRequired(req.body, ['type', 'name', 'email', 'date', 'time', 'guest_count']);
  if (!valid) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const { type, name, email, phone, date, time, guest_count, message } = req.body;

  // Validate reservation type
  const validTypes = ['table', 'party', 'event', 'package'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid reservation type. Must be one of: ${validTypes.join(', ')}` });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Validate future date
  if (!isFutureDate(date)) {
    return res.status(400).json({ error: 'Reservation date must be today or in the future' });
  }

  // Validate guest count
  const guestCount = parseInt(guest_count, 10);
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 500) {
    return res.status(400).json({ error: 'Guest count must be between 1 and 500' });
  }

  try {
    // Insert reservation
    const reservation = {
      type: sanitize(type),
      name: sanitize(name),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : null,
      date,
      time,
      guest_count: guestCount,
      message: message ? sanitize(message) : null,
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
      return res.status(500).json({ error: 'Failed to save reservation' });
    }

    // Send "received" email to customer (non-blocking)
    const emailResult = await sendReservationReceivedEmail(email, data);
    if (emailResult.success) {
      await supabaseAdmin
        .from('reservations')
        .update({ email_confirmed_sent: true })
        .eq('id', data.id);
    }

    // Notify admin (non-blocking, don't fail the request)
    sendAdminReservationNotification(data).catch((err) => {
      console.error('Admin notification failed:', err);
    });

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
    return res.status(500).json({ error: 'Internal server error' });
  }
};
