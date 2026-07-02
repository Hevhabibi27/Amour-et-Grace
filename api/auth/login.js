const { supabase } = require('../_lib/supabase');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');

/**
 * POST /api/auth/login
 * Admin login using Supabase Auth (email + password).
 * Rate-limited to 5 attempts per 15 minutes per IP.
 * Returns a JWT access token on success.
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting — strict for login
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = await checkRateLimit(ip, '/api/auth/login', { failClosed: true });
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      retryAfterMs,
    });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if this email is the authorized admin (fail-closed)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({
      token: data.session.access_token,
      user: {
        email: data.user.email,
        id: data.user.id,
      },
    });
  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
