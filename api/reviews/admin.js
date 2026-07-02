const { supabaseAdmin } = require('../_lib/supabase');
const { verifyAdmin } = require('../_lib/auth');
const { isValidUUID } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');

/**
 * /api/reviews/admin
 * GET  — List all reviews (including unapproved) for admin
 * PATCH — Approve or reject a review
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

  // ── GET: List all reviews ──
  if (req.method === 'GET') {
    const ip = getClientIp(req);
    const { allowed: getAllowed } = await checkRateLimit(ip, '/api/reviews/admin/get');
    if (!getAllowed) return res.status(429).json({ error: 'Too many requests. Please slow down.' });

    try {
      let query = supabaseAdmin
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      // Optional filter: ?approved=true or ?approved=false
      const { approved } = req.query || {};
      if (approved === 'true') {
        query = query.eq('is_approved', true);
      } else if (approved === 'false') {
        query = query.eq('is_approved', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Admin fetch reviews error:', error);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }

      return res.status(200).json({ reviews: data });
    } catch (err) {
      console.error('Admin fetch reviews exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── PATCH: Approve or reject a review ──
  if (req.method === 'PATCH') {
    const ip = getClientIp(req);
    const { allowed: patchAllowed } = await checkRateLimit(ip, '/api/reviews/admin/patch');
    if (!patchAllowed) return res.status(429).json({ error: 'Too many requests. Please slow down.' });

    const { id, is_approved } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid Review ID format' });
    }

    if (typeof is_approved !== 'boolean') {
      return res.status(400).json({ error: 'is_approved must be a boolean (true or false)' });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ is_approved })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update review error:', error);
        return res.status(500).json({ error: 'Failed to update review' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Review not found' });
      }

      return res.status(200).json({
        message: `Review ${is_approved ? 'approved' : 'rejected'} successfully`,
        review: data,
      });
    } catch (err) {
      console.error('Update review exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── DELETE: Remove a review ──
  if (req.method === 'DELETE') {
    const ip = getClientIp(req);
    const { allowed: deleteAllowed } = await checkRateLimit(ip, '/api/reviews/admin/delete');
    if (!deleteAllowed) return res.status(429).json({ error: 'Too many requests. Please slow down.' });

    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid Review ID format' });
    }

    try {
      const { error } = await supabaseAdmin
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({ error: 'Failed to delete review' });
      }

      return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error('Delete review exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
