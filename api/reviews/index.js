const { supabaseAdmin } = require('../_lib/supabase');
const { supabase } = require('../_lib/supabase');
const { validateRequired, sanitize, checkMaxLengths } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');

/**
 * /api/reviews
 * GET  — List approved reviews (public)
 * POST — Submit a new text-only review (rate-limited, requires admin approval)
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── GET: List approved reviews (public) ──
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, name, rating, comment, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch reviews error:', error);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }

      return res.status(200).json({ reviews: data });
    } catch (err) {
      console.error('Fetch reviews exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── POST: Submit a review (text-only) ──
  if (req.method === 'POST') {
    // Rate limiting
    const ip = getClientIp(req);
    const { allowed, remaining, retryAfterMs } = await checkRateLimit(ip, '/api/reviews');
    if (!allowed) {
      return res.status(429).json({
        error: 'Too many reviews submitted. Please try again later.',
        retryAfterMs,
      });
    }

    // Validate required fields
    const { valid, missing } = validateRequired(req.body, ['name', 'rating', 'comment']);
    if (!valid) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const { name, rating, comment } = req.body;

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Max-length enforcement
    const tooLong = checkMaxLengths(req.body, { name: 100, comment: 1000 });
    if (tooLong) {
      return res.status(400).json({ error: `${tooLong.field} exceeds ${tooLong.max} characters` });
    }

    try {
      const review = {
        name: sanitize(name),
        rating: ratingNum,
        comment: sanitize(comment),
        is_approved: false, // Requires admin approval before going public
        ip_address: ip,
      };

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) {
        console.error('Review insert error:', error);
        return res.status(500).json({ error: 'Failed to save review' });
      }

      return res.status(201).json({
        message: 'Thank you! Your review has been submitted and is pending approval.',
        review: {
          id: data.id,
          name: data.name,
          rating: data.rating,
          created_at: data.created_at,
        },
        remaining,
      });
    } catch (err) {
      console.error('Review submit exception:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
