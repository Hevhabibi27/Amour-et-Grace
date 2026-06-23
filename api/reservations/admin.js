const { supabaseAdmin } = require('../_lib/supabase');
const { verifyAdmin } = require('../_lib/auth');
const { isValidUUID } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');
const { sendReservationStatusEmail } = require('../_lib/email');

/**
 * /api/reservations/admin
 *
 * GET   — List all reservations (with optional status + date filters)
 * PATCH — Accept or reject a reservation + send status email
 *
 * All methods require admin authentication (Bearer JWT).
 *
 * Security:
 *   - Rate limited (GET: 120/min, PATCH: 60/min per IP)
 *   - UUID format validation on reservation ID
 *   - Atomic status update (WHERE status = 'pending') prevents:
 *       • Double-accept (admin clicks Accept twice)
 *       • Two admins acting simultaneously
 *       • Accepting an already-rejected reservation (and vice versa)
 *   - Email failures never block the status update
 */
module.exports = async (req, res) => {
  // ── CORS preflight ──
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Rate limiting ──
  const ip = getClientIp(req);
  const endpoint = req.method === 'GET'
    ? '/api/reservations/admin/get'
    : '/api/reservations/admin/patch';
  const { allowed, retryAfterMs } = await checkRateLimit(ip, endpoint);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests.', retryAfterMs });
  }

  // ── Admin auth ──
  const { authenticated, error: authError } = await verifyAdmin(req);
  if (!authenticated) {
    return res.status(401).json({ error: authError || 'Not authenticated' });
  }

  // ── GET: List reservations ──
  if (req.method === 'GET') {
    try {
      let query = supabaseAdmin
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      // Optional status filter: ?status=pending
      const { status, date, limit: limitParam } = req.query || {};

      if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
        query = query.eq('status', status);
      }

      // Optional date filter: ?date=2025-07-15
      if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return res.status(400).json({ error: 'Invalid date filter format. Use YYYY-MM-DD.' });
        }
        query = query.eq('date', date);
      }

      // Optional limit: ?limit=10
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch reservations error:', error);
        return res.status(500).json({ error: 'Failed to fetch reservations' });
      }

      return res.status(200).json({ reservations: data });
    } catch (err) {
      console.error('Fetch reservations exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── PATCH: Accept or reject a reservation ──
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};

    // Validate reservation ID exists
    if (!id) {
      return res.status(400).json({ error: 'Reservation ID is required.' });
    }

    // Validate UUID format (prevents SQL injection via malformed IDs)
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid reservation ID format.' });
    }

    // Validate status value
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected".' });
    }

    try {
      // ── Atomic status update ──
      // Only updates if the reservation is still 'pending'.
      // This single query prevents:
      //   - Double-accept (admin clicks Accept twice rapidly)
      //   - Two admins clicking Accept/Reject simultaneously
      //   - Accepting an already-rejected reservation
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('reservations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending')  // ← atomic guard: only updates if still pending
        .select()
        .single();

      if (updateError || !updated) {
        // Row was not updated — either not found or already finalized
        const { data: current } = await supabaseAdmin
          .from('reservations')
          .select('status')
          .eq('id', id)
          .single();

        if (current && current.status !== 'pending') {
          return res.status(409).json({
            error: `Reservation is already ${current.status}. Cannot change status.`,
          });
        }

        return res.status(404).json({ error: 'Reservation not found.' });
      }

      // ── Send status email to customer (non-blocking) ──
      let emailSent = false;
      try {
        const emailResult = await sendReservationStatusEmail(updated.email, updated, status);
        emailSent = emailResult.success;

        if (emailSent) {
          // Mark that we sent the status email (best-effort)
          await supabaseAdmin
            .from('reservations')
            .update({ email_status_sent: true })
            .eq('id', id);
        }
      } catch (emailErr) {
        console.error('Status email failed (update still saved):', emailErr);
      }

      return res.status(200).json({
        message: `Reservation ${status} successfully.`,
        reservation: updated,
        emailSent,
      });
    } catch (err) {
      console.error('Update reservation exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
