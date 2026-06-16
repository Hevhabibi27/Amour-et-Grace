const { supabaseAdmin } = require('../_lib/supabase');
const { supabase } = require('../_lib/supabase');
const { validateRequired, sanitize } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');

/**
 * /api/reviews
 * GET  — List approved reviews (public)
 * POST — Submit a new review (rate-limited)
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
        .select('id, name, rating, comment, media_urls, created_at')
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

  // ── POST: Submit a review ──
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
    const { valid, missing } = validateRequired(req.body, ['name', 'rating']);
    if (!valid) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const { name, rating, comment, media_urls } = req.body;

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
      const review = {
        name: sanitize(name),
        rating: ratingNum,
        comment: comment ? sanitize(comment) : null,
        media_urls: Array.isArray(media_urls) ? media_urls : null,
        is_approved: true, // Reviews go live immediately
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
        message: 'Review submitted successfully. Thank you!',
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
