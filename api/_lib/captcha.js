/**
 * Cloudflare Turnstile CAPTCHA verification for Amour et Grace.
 *
 * Used in: api/reservations/index.js (before saving a reservation)
 *
 * Flow:
 *   1. Frontend renders the Turnstile widget (invisible or managed mode)
 *   2. User completes the challenge → gets a `cf-turnstile-response` token
 *   3. Frontend sends the token in the POST body as `captcha_token`
 *   4. This module verifies it server-side with Cloudflare's siteverify API
 *
 * Setup:
 *   1. Go to https://dash.cloudflare.com → Turnstile → Add Site
 *   2. Get your Site Key (frontend) and Secret Key (backend)
 *   3. Set TURNSTILE_SECRET_KEY in Vercel Environment Variables
 *   4. Add the Site Key to the frontend HTML widget's data-sitekey attribute
 *
 * Security notes:
 *   - Tokens are single-use and expire after 300 seconds
 *   - Never expose TURNSTILE_SECRET_KEY in frontend code
 *   - In development (no key set), CAPTCHA is skipped with a console warning
 */

/**
 * Verify a Cloudflare Turnstile CAPTCHA token.
 *
 * @param {string} token - The `cf-turnstile-response` token from the frontend
 * @returns {Promise<boolean>} - true if verification passed, false otherwise
 */
async function verifyCaptcha(token) {
  if (!token) return false;

  // Skip CAPTCHA in development if secret key is not configured
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification (dev mode).');
    return true;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Turnstile API returned HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      // Log error codes for debugging (e.g. 'invalid-input-response', 'timeout-or-duplicate')
      console.warn('Turnstile verification failed:', data['error-codes'] || 'unknown');
    }

    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification exception:', err);
    return false;
  }
}

module.exports = { verifyCaptcha };
