/**
 * Input validation helpers for API endpoints.
 *
 * Business rules (Amour et Grace — Japan):
 *
 *   Reservation types: 'table', 'event', 'lounge'
 *
 *   Hours (day-dependent):
 *     - Resto Bar:  Sunday 11:00–24:00
 *     - Lounge:     Wed & Thu 20:00–24:00, Fri & Sat 19:00–02:00
 *     - Events:     9:00–17:00 (booking window)
 *
 *   Closed:    Monday & Tuesday
 *   Guest count:  1–500 (backend max; physical lounge is 20, admin manages)
 *   Timezone:     JST = UTC+9 (no daylight saving in Japan)
 */

// ── Constants ────────────────────────────────────────────────────

const VALID_TYPES = ['table', 'event', 'lounge'];

/**
 * Business hours by service category.
 *
 * Resto Bar:  Sunday only, 11:00–24:00
 * Lounge:     Wed/Thu 20:00–24:00, Fri/Sat 19:00–02:00
 * Events:     9:00–17:00 (booking window for party & event reservations)
 */
const BUSINESS_HOURS = {
  restobar: { open: 11 * 60, close: 24 * 60 },   // 11:00–24:00 (660–1440 min) — Sunday only
  lounge_wed_thu: { open: 20 * 60, close: 24 * 60 },  // 20:00–24:00
  lounge_fri_sat: { open: 19 * 60, close: 2 * 60 },   // 19:00–02:00 (spans midnight)
  event: { open: 9 * 60, close: 17 * 60 },        // 09:00–17:00 (booking window)
};

/** Restaurant is closed on Monday (1) and Tuesday (2) */
const RESTAURANT_CLOSED_DAYS = [1, 2]; // Monday, Tuesday

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

/**
 * Get the day of the week for a given date string in JST.
 * Returns 0=Sunday, 1=Monday, ..., 6=Saturday.
 */
function getDayOfWeekJST(dateStr) {
  // Parse as JST by appending +09:00
  const date = new Date(dateStr + 'T12:00:00+09:00');
  // getUTCDay after offsetting to JST noon is reliable
  return date.getUTCDay();
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

// ── Type validation ──────────────────────────────────────────────

/**
 * Validate that a reservation type is one of the allowed values.
 * Allowed: 'table', 'event', 'lounge'
 */
function isValidType(type) {
  return typeof type === 'string' && VALID_TYPES.includes(type);
}

// ── Time validation (type-dependent) ─────────────────────────────

/**
 * Parse a time string into total minutes.
 * Returns null if the format is invalid.
 *
 * @param {string} timeStr - "HH:MM"
 * @returns {number|null} - total minutes (0–1439), or null
 */
function parseTimeToMinutes(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

/**
 * Validate a time string is HH:MM format and within business hours
 * for the given reservation type and day of the week.
 *
 * Hours depend on reservation type and day:
 *   - 'table' (resto bar): Sunday only 11:00–24:00
 *   - 'event':             9:00–17:00 (booking window)
 *   - 'lounge':            Wed/Thu 20:00–24:00, Fri/Sat 19:00–02:00
 *
 * @param {string} timeStr - "HH:MM"
 * @param {string} type - reservation type ('table', 'event', 'lounge')
 * @param {string} [dateStr] - optional "YYYY-MM-DD" for day-dependent hours
 * @returns {boolean}
 */
function isValidTime(timeStr, type, dateStr) {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes === null) return false;

  if (type === 'event') {
    // Event booking window: 9:00–17:00
    const { open, close } = BUSINESS_HOURS.event;
    return totalMinutes >= open && totalMinutes <= close;
  } else if (type === 'lounge') {
    // Lounge: day-dependent
    if (dateStr) {
      const dayOfWeek = getDayOfWeekJST(dateStr);
      if (dayOfWeek === 3 || dayOfWeek === 4) {
        // Wed/Thu: 20:00–24:00
        const { open, close } = BUSINESS_HOURS.lounge_wed_thu;
        return totalMinutes >= open && totalMinutes <= close;
      } else if (dayOfWeek === 5 || dayOfWeek === 6) {
        // Fri/Sat: 19:00–02:00 (spans midnight)
        const { open, close } = BUSINESS_HOURS.lounge_fri_sat;
        return totalMinutes >= open || totalMinutes <= close;
      }
    }
    // Fallback: accept any lounge hour (19:00–02:00 widest range)
    return totalMinutes >= 19 * 60 || totalMinutes <= 2 * 60;
  } else {
    // Table (resto bar): Sunday 11:00–24:00
    const { open, close } = BUSINESS_HOURS.restobar;
    return totalMinutes >= open && totalMinutes <= close;
  }
}

// ── Date + type combined validation ──────────────────────────────

/**
 * Check if the restaurant is open on the given date.
 * The restaurant is closed on Mondays and Tuesdays.
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {{ open: boolean, reason?: string }}
 */
function isRestaurantOpenOnDate(dateStr) {
  const dayOfWeek = getDayOfWeekJST(dateStr);
  if (RESTAURANT_CLOSED_DAYS.includes(dayOfWeek)) {
    return { open: false, reason: 'We are closed on Mondays and Tuesdays.' };
  }
  return { open: true };
}

// ── Phone validation ─────────────────────────────────────────────

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

// ── UUID validation ──────────────────────────────────────────────

/**
 * Validate a UUID v4 format string.
 * Used for admin PATCH endpoint to validate reservation_id.
 */
function isValidUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ── Max-length enforcement ───────────────────────────────────────

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

// ── Stronger sanitization ────────────────────────────────────────

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
    .replace(/\bon\w+\s*=/gi, '');    // Strip inline event handlers (onclick=, onerror=, etc.)
}

// ── Exports ──────────────────────────────────────────────────────

module.exports = {
  // Existing (preserved API)
  validateRequired,
  isValidEmail,
  isFutureDate,
  sanitize,
  // Type & time (type-dependent)
  isValidType,
  isValidTime,
  isRestaurantOpenOnDate,
  // Field validators
  isValidPhone,
  isValidUUID,
  isDateWithinMaxAdvance,
  checkMaxLengths,
  // Helpers
  getTodayJST,
  getDayOfWeekJST,
  // Constants (for use in index.js / admin.js)
  VALID_TYPES,
  BUSINESS_HOURS,
};
