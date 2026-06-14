/**
 * Input validation helpers for API endpoints.
 */

/**
 * Validate that required fields exist and are non-empty strings.
 * @param {object} body - Request body
 * @param {string[]} fields - Required field names
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateRequired(body, fields) {
  const missing = fields.filter(
    (f) => !body[f] || (typeof body[f] === 'string' && body[f].trim() === '')
  );
  return { valid: missing.length === 0, missing };
}

/**
 * Validate an email address format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a date string is a valid future date.
 */
function isFutureDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Sanitize a string — trim and remove HTML tags.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '');
}

module.exports = { validateRequired, isValidEmail, isFutureDate, sanitize };
