const { supabaseAdmin } = require('./supabase');

/**
 * Rate limiter using Supabase — atomic version.
 *
 * Uses an RPC function (`increment_rate_limit`) that performs the
 * check + increment in a single SQL transaction. This prevents the
 * race condition where two concurrent requests both read count=2,
 * both increment to 3, and the limit of 3 is never enforced.
 *
 * ── Required: run this SQL in Supabase SQL Editor ──
 *
 * CREATE OR REPLACE FUNCTION increment_rate_limit(
 *   p_ip       TEXT,
 *   p_endpoint TEXT,
 *   p_window_ms BIGINT,
 *   p_max      INTEGER
 * )
 * RETURNS TABLE(allowed BOOLEAN, request_count INTEGER)
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * DECLARE
 *   v_window_start TIMESTAMPTZ;
 *   v_count        INTEGER;
 * BEGIN
 *   v_window_start := NOW() - (p_window_ms || ' milliseconds')::INTERVAL;
 *
 *   -- Remove expired windows for this IP+endpoint
 *   DELETE FROM rate_limits
 *     WHERE ip_address = p_ip
 *       AND endpoint   = p_endpoint
 *       AND window_start < v_window_start;
 *
 *   -- Atomically insert or increment (single round-trip, no race)
 *   INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
 *     VALUES (p_ip, p_endpoint, 1, NOW())
 *   ON CONFLICT (ip_address, endpoint)
 *     DO UPDATE SET request_count = rate_limits.request_count + 1
 *   RETURNING rate_limits.request_count INTO v_count;
 *
 *   IF v_count IS NULL THEN v_count := 1; END IF;
 *
 *   RETURN QUERY SELECT (v_count <= p_max), v_count;
 * END;
 * $$;
 *
 * ── Existing table schema (already created) ──
 *
 * CREATE TABLE rate_limits (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   ip_address TEXT NOT NULL,
 *   endpoint TEXT NOT NULL,
 *   request_count INTEGER DEFAULT 1,
 *   window_start TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(ip_address, endpoint)
 * );
 */

// ── Rate limit configuration per endpoint ────────────────────────

const LIMITS = {
  // Public endpoints
  '/api/auth/login':               { max: 5,   windowMs: 15 * 60 * 1000 },   // 5 per 15 min (brute-force)
  '/api/reservations':             { max: 10,  windowMs: 60 * 60 * 1000 },   // 10 per hour
  '/api/reviews':                  { max: 2,   windowMs: 24 * 60 * 60 * 1000 }, // 2 per day
  '/api/inquiry':                  { max: 5,   windowMs: 60 * 60 * 1000 },   // 5 per hour
  '/api/chat':                     { max: 20,  windowMs: 60 * 60 * 1000 },   // 20 per hour

  // Admin endpoints
  '/api/reservations/admin/get':   { max: 120, windowMs: 60 * 1000 },        // 120 per minute
  '/api/reservations/admin/patch': { max: 60,  windowMs: 60 * 1000 },        // 60 per minute
  '/api/reviews/admin/get':        { max: 120, windowMs: 60 * 1000 },        // 120 per minute
  '/api/reviews/admin/patch':      { max: 60,  windowMs: 60 * 1000 },        // 60 per minute
  '/api/reviews/admin/delete':     { max: 30,  windowMs: 60 * 1000 },        // 30 per minute
  '/api/inquiry/admin/get':        { max: 120, windowMs: 60 * 1000 },        // 120 per minute
  '/api/inquiry/admin/patch':      { max: 60,  windowMs: 60 * 1000 },        // 60 per minute
};

// ── Atomic rate limit check ──────────────────────────────────────

/**
 * Check and enforce rate limit for a given IP and endpoint.
 *
 * Uses the `increment_rate_limit` Supabase RPC function for atomic
 * check+increment. Falls back to the legacy SELECT+UPDATE approach
 * if the RPC doesn't exist yet (graceful migration).
 *
 * @param {string} ip       - Client IP address
 * @param {string} endpoint - API endpoint path (must match a LIMITS key)
 * @param {object} [opts]   - Options
 * @param {boolean} [opts.failClosed=false] - If true, DB errors block the request (use for login)
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfterMs?: number }>}
 */
async function checkRateLimit(ip, endpoint, { failClosed = false } = {}) {
  const config = LIMITS[endpoint];
  if (!config) return { allowed: true, remaining: Infinity };

  try {
    // ── Try atomic RPC first ──
    const { data, error } = await supabaseAdmin.rpc('increment_rate_limit', {
      p_ip:        ip,
      p_endpoint:  endpoint,
      p_window_ms: config.windowMs,
      p_max:       config.max,
    });

    if (error) {
      // RPC doesn't exist yet — fall back to legacy approach
      if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.warn('increment_rate_limit RPC not found — using legacy rate limiter. Please run the SQL migration.');
        return checkRateLimitLegacy(ip, endpoint, config);
      }
      // Other DB error — fail closed for sensitive endpoints, fail open otherwise
      console.error('Rate limit RPC error:', error);
      if (failClosed) return { allowed: false, remaining: 0, retryAfterMs: config.windowMs };
      return { allowed: true, remaining: config.max };
    }

    const row = data?.[0];
    const allowed = row?.allowed ?? true;
    const count = row?.request_count ?? 1;

    return {
      allowed,
      remaining: Math.max(0, config.max - count),
      retryAfterMs: allowed ? undefined : config.windowMs,
    };
  } catch (err) {
    // Network error or unexpected failure
    console.error('Rate limit exception:', err);
    if (failClosed) return { allowed: false, remaining: 0, retryAfterMs: config.windowMs };
    return { allowed: true, remaining: config.max };
  }
}

// ── Legacy fallback (kept for graceful migration) ────────────────

/**
 * Legacy rate limiter — uses separate SELECT + UPDATE queries.
 *
 * ⚠️  Has a TOCTOU race condition: two concurrent requests can both
 *     read count=2, both increment to 3, and a limit of 3 is bypassed.
 *     This is acceptable as a temporary fallback until the RPC is created.
 *
 * @param {string} ip
 * @param {string} endpoint
 * @param {{ max: number, windowMs: number }} config
 */
async function checkRateLimitLegacy(ip, endpoint, config) {
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

// ── IP extraction ────────────────────────────────────────────────

/**
 * Get the client IP from a Vercel serverless request.
 * Checks headers in order of reliability:
 *   1. x-forwarded-for (set by Vercel's proxy — first IP is the client)
 *   2. x-real-ip (alternative proxy header)
 *   3. socket.remoteAddress (direct connection, unlikely on Vercel)
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

// ── Exports ──────────────────────────────────────────────────────

module.exports = { checkRateLimit, getClientIp, LIMITS };
