/**
 * Input validation helpers for API endpoints.
 *
 * Business rules (Amour et Grace — Japan):
 *   - Business hours: 10:00–17:00 JST (10 AM – 5 PM)
 *   - Operating days:  Monday–Sunday (every day, no closed days)
 *   - Guest count:     1–500 (backend max; physical lounge is 20, admin manages)
 *   - Timezone:        JST = UTC+9 (no daylight saving in Japan)
 */

// ── JST Helpers ──────────────────────────────────────────────────

/**
 * Get the current date string in JST (YYYY-MM-DD).
 * Japan does NOT observe daylight saving — always UTC+9.
 */
function getTodayJST() {
  const now = new Date();
  // Shift UTC time by +9 hours to get JST
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// ── Existing (preserved) ─────────────────────────────────────────

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
 * Max length 254 per RFC 5321.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Fixed: JST-aware date check ──────────────────────────────────

/**
 * Validate a date string is a valid future date (compared against JST).
 *
 * Rejects:
 *   - Invalid date strings
 *   - Dates in the past (JST)
 *   - Today's date in JST (same-day bookings not allowed)
 *
 * Why JST: The server runs on Vercel (UTC). A customer in Japan submitting
 * at 23:00 UTC on July 14 is actually at 08:00 JST on July 15.
 * Comparing against UTC would incorrectly treat July 15 as "today".
 */
function isFutureDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const todayJST = getTodayJST(); // "YYYY-MM-DD"
  // dateStr must be strictly AFTER today in JST (no same-day)
  return dateStr > todayJST;
}

/**
 * Check that a date is not more than 6 months (~180 days) in the future.
 * Prevents absurd bookings like 5 years out.
 */
function isDateWithinMaxAdvance(dateStr, maxDays = 180) {
  if (typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  return date <= maxDate;
}

// ── New: Time validation ─────────────────────────────────────────

/**
 * Validate a time string is HH:MM format and within business hours.
 * Business hours: 10:00–17:00 JST (10 AM – 5 PM).
 *
 * 17:00 is the last valid reservation start time.
 * Times like 17:01 or later are rejected.
 */
function isValidTime(timeStr) {
  if (typeof timeStr !== 'string') return false;

  // Must be HH:MM format
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);

  // Basic range check
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;

  // Business hours: 10:00–17:00 (inclusive)
  // Convert to total minutes for easy comparison
  const totalMinutes = hour * 60 + minute;
  const openAt = 10 * 60;   // 10:00 = 600 minutes
  const closeAt = 17 * 60;  // 17:00 = 1020 minutes

  return totalMinutes >= openAt && totalMinutes <= closeAt;
}

// ── New: Phone validation ────────────────────────────────────────

/**
 * Validate a phone number format (optional field).
 * Allows: digits, spaces, +, -, (, )
 * Length: 7–20 characters
 *
 * Accepts Japanese formats like:
 *   - 090-3856-2854
 *   - +81 90 3856 2854
 *   - 0568-48-0259
 */
function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (trimmed.length < 7 || trimmed.length > 20) return false;
  return /^[\d\s+\-().]+$/.test(trimmed);
}

// ── New: UUID validation ─────────────────────────────────────────

/**
 * Validate a UUID v4 format string.
 * Used for admin PATCH endpoint to validate reservation_id.
 */
function isValidUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ── New: Max-length enforcement ──────────────────────────────────

/**
 * Check multiple fields against max-length limits.
 * Returns the first field that exceeds its limit, or null if all pass.
 *
 * @param {object} body - Request body
 * @param {object} limits - { fieldName: maxLength }
 * @returns {{ field: string, max: number } | null}
 *
 * Usage:
 *   const tooLong = checkMaxLengths(body, { name: 100, email: 254, message: 500 });
 *   if (tooLong) return res.status(400).json({ error: `${tooLong.field} exceeds ${tooLong.max} characters` });
 */
function checkMaxLengths(body, limits) {
  for (const [field, max] of Object.entries(limits)) {
    if (body[field] && typeof body[field] === 'string' && body[field].length > max) {
      return { field, max };
    }
  }
  return null;
}

// ── Fixed: Stronger sanitization ─────────────────────────────────

/**
 * Sanitize a string — trim and strip ALL HTML/script content.
 *
 * Removes:
 *   - HTML tags (including malformed ones like <img onerror=... with no closing >)
 *   - javascript: protocol URIs
 *   - Inline event handlers (onclick=, onerror=, etc.)
 *
 * Preserves:
 *   - Emoji (safe, not an XSS vector)
 *   - Unicode text (Japanese characters, etc.)
 *   - Plain text content
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>?/gm, '')       // Strip all HTML tags (including malformed/unclosed)
    .replace(/javascript\s*:/gi, '')  // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, '');      // Strip inline event handlers (onclick=, onerror=, etc.)
}

// ── Exports ──────────────────────────────────────────────────────

module.exports = {
  // Existing (preserved API)
  validateRequired,
  isValidEmail,
  isFutureDate,
  sanitize,
  // New additions
  isValidTime,
  isValidPhone,
  isValidUUID,
  isDateWithinMaxAdvance,
  checkMaxLengths,
  // Helpers
  getTodayJST,
};
