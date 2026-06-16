const { verifyAdmin } = require('../_lib/auth');

/**
 * GET /api/auth/verify
 * Verify that the admin's JWT token is still valid.
 * Used on page load to check if the session is alive.
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { authenticated, user, error } = await verifyAdmin(req);

  if (!authenticated) {
    return res.status(401).json({ error: error || 'Not authenticated' });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      email: user.email,
      id: user.id,
    },
  });
};
