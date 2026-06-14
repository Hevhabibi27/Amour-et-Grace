const { supabaseAdmin } = require('./supabase');

/**
 * Rate limiter using Supabase.
 * Tracks request counts by IP + endpoint in a `rate_limits` table.
 *
 * Table schema (create in Supabase SQL editor):
 * CREATE TABLE rate_limits (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   ip_address TEXT NOT NULL,
 *   endpoint TEXT NOT NULL,
 *   request_count INTEGER DEFAULT 1,
 *   window_start TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(ip_address, endpoint)
 * );
 */

const LIMITS = {
  '/api/reservations': { max: 3, windowMs: 60 * 60 * 1000 },       // 3 per hour
  '/api/reviews':      { max: 2, windowMs: 24 * 60 * 60 * 1000 },  // 2 per day
  '/api/inquiry':      { max: 5, windowMs: 60 * 60 * 1000 },       // 5 per hour
  '/api/chat':         { max: 20, windowMs: 60 * 60 * 1000 },      // 20 per hour
};

/**
 * Check and enforce rate limit for a given IP and endpoint.
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API endpoint path
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs?: number }}
 */
async function checkRateLimit(ip, endpoint) {
  const config = LIMITS[endpoint];
  if (!config) return { allowed: true, remaining: Infinity };

  const windowStart = new Date(Date.now() - config.windowMs).toISOString();

  // Get existing record for this IP + endpoint
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart)
    .single();

  if (!existing) {
    // First request in this window — create record
    await supabaseAdmin.from('rate_limits').upsert({
      ip_address: ip,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    }, { onConflict: 'ip_address,endpoint' });

    return { allowed: true, remaining: config.max - 1 };
  }

  if (existing.request_count >= config.max) {
    const retryAfterMs = new Date(existing.window_start).getTime() + config.windowMs - Date.now();
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  // Increment counter
  await supabaseAdmin
    .from('rate_limits')
    .update({ request_count: existing.request_count + 1 })
    .eq('id', existing.id);

  return { allowed: true, remaining: config.max - existing.request_count - 1 };
}

/**
 * Get the client IP from a Vercel serverless request.
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

module.exports = { checkRateLimit, getClientIp, LIMITS };
