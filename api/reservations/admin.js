const { supabaseAdmin } = require('../_lib/supabase');
const { verifyAdmin } = require('../_lib/auth');
const { sendReservationStatusEmail } = require('../_lib/email');

/**
 * /api/reservations/admin
 * GET  — List all reservations (with optional status filter)
 * PATCH — Accept or reject a reservation + send status email
 *
 * All methods require admin authentication.
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify admin auth
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
      const { status } = req.query || {};
      if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
        query = query.eq('status', status);
      }

      // Optional limit: ?limit=10
      const limit = parseInt(req.query?.limit, 10);
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

    if (!id) {
      return res.status(400).json({ error: 'Reservation ID is required' });
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
    }

    try {
      // Fetch the reservation first (to get email for notification)
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Update status
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('reservations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update reservation error:', updateError);
        return res.status(500).json({ error: 'Failed to update reservation' });
      }

      // Send status email to customer
      const emailResult = await sendReservationStatusEmail(existing.email, existing, status);
      if (emailResult.success) {
        await supabaseAdmin
          .from('reservations')
          .update({ email_status_sent: true })
          .eq('id', id);
      }

      return res.status(200).json({
        message: `Reservation ${status} successfully`,
        reservation: updated,
        emailSent: emailResult.success,
      });
    } catch (err) {
      console.error('Update reservation exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
