const { supabase } = require('./supabase');

/**
 * Verify admin authentication using Supabase Auth JWT.
 * Checks the Authorization header for a valid Bearer token.
 *
 * @param {object} req - Vercel request object
 * @returns {{ authenticated: boolean, user?: object, error?: string }}
 */
async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  return { authenticated: true, user };
}

module.exports = { verifyAdmin };
