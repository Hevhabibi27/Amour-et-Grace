const { supabaseAdmin } = require('../_lib/supabase');
const { verifyAdmin } = require('../_lib/auth');

/**
 * /api/inquiry/admin
 * GET  — List all inquiries (with optional read/unread filter)
 * PATCH — Mark an inquiry as read/unread
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

  // ── GET: List all inquiries ──
  if (req.method === 'GET') {
    try {
      let query = supabaseAdmin
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      // Optional filter: ?read=true or ?read=false
      const { read } = req.query || {};
      if (read === 'true') {
        query = query.eq('is_read', true);
      } else if (read === 'false') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch inquiries error:', error);
        return res.status(500).json({ error: 'Failed to fetch inquiries' });
      }

      return res.status(200).json({ inquiries: data });
    } catch (err) {
      console.error('Fetch inquiries exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── PATCH: Mark inquiry as read/unread ──
  if (req.method === 'PATCH') {
    const { id, is_read } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Inquiry ID is required' });
    }

    if (typeof is_read !== 'boolean') {
      return res.status(400).json({ error: 'is_read must be a boolean (true or false)' });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update inquiry error:', error);
        return res.status(500).json({ error: 'Failed to update inquiry' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      return res.status(200).json({
        message: `Inquiry marked as ${is_read ? 'read' : 'unread'}`,
        inquiry: data,
      });
    } catch (err) {
      console.error('Update inquiry exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
