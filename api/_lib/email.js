const { Resend } = require('resend');

/**
 * Email helpers for Amour et Grace — Resend integration.
 *
 * Security:
 *   - All user-submitted data is escaped with escapeHtml() before
 *     being inserted into email HTML templates. This prevents XSS
 *     if a malicious name/message like "</td><script>..." is submitted.
 *
 * Japan / JST:
 *   - All dates are formatted in Japanese locale (2025年7月15日)
 *   - All times are labeled with (JST / 日本標準時)
 *   - Lounge physical capacity (20 people) noted in admin emails
 *
 * Critical rule:
 *   - Email failures must NEVER block a reservation save.
 *   - Callers wrap email calls in try/catch and proceed on failure.
 */

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@amouretgrace.com';

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Get the Resend client lazily.
 * Returns null if RESEND_API_KEY is not set — callers must check for null.
 * This prevents the module from crashing on startup when the env var is missing.
 */
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set — email sending is disabled.');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Escape HTML special characters to prevent XSS in email templates.
 * Must be used on ALL user-submitted data before inserting into HTML.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a date string (YYYY-MM-DD) in Japanese locale.
 * → "2025年7月15日"
 */
function formatDateJST(dateStr) {
  if (!dateStr) return dateStr;
  try {
    // Append T00:00:00+09:00 to parse as JST, not UTC
    const parsed = new Date(dateStr + 'T00:00:00+09:00');
    if (isNaN(parsed.getTime())) return dateStr; // invalid date — return raw
    return parsed.toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // → "2025年7月15日"
  } catch {
    return dateStr; // fallback to raw string if parsing fails
  }
}

/**
 * Format a time string with JST label.
 * "18:00" → "18:00 (JST)"
 */
function formatTimeJST(timeStr) {
  if (!timeStr) return timeStr;
  return `${timeStr} (JST)`;
}

/**
 * Capitalize a reservation type for display.
 * "table" → "Table", "party" → "Party"
 */
function capitalizeType(type) {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// ── Shared email wrapper (brand header + footer) ─────────────────

const BRAND_COLOR = '#8B6914';
const BORDER_COLOR = '#E8D5A3';

function emailWrapper(bodyHtml) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: ${BRAND_COLOR}; font-family: 'Playfair Display', Georgia, serif;">Amour et Grace</h1>
      <hr style="border: 1px solid ${BORDER_COLOR};">
      ${bodyHtml}
      <hr style="border: 1px solid ${BORDER_COLOR};">
      <p style="color: #999; font-size: 12px;">Amour et Grace — Where love meets grace</p>
    </div>
  `;
}

/**
 * Build a reservation details table for emails.
 * All values are HTML-escaped for safety.
 */
function reservationDetailsTable(reservation, options = {}) {
  const { showName = false, showEmail = false, showPhone = false, showMessage = false } = options;

  const rows = [];

  if (showName) {
    rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${escapeHtml(reservation.name)}</td></tr>`);
  }
  if (showEmail) {
    rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${escapeHtml(reservation.email)}</td></tr>`);
  }
  if (showPhone) {
    rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${escapeHtml(reservation.phone) || 'N/A'}</td></tr>`);
  }

  rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${escapeHtml(capitalizeType(reservation.type))}</td></tr>`);
  rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${escapeHtml(formatDateJST(reservation.date))}</td></tr>`);
  rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${escapeHtml(formatTimeJST(reservation.time))}</td></tr>`);
  rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Guests</td><td style="padding: 8px;">${escapeHtml(String(reservation.guest_count))}</td></tr>`);

  if (showMessage && reservation.message) {
    rows.push(`<tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${escapeHtml(reservation.message)}</td></tr>`);
  }

  return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">${rows.join('')}</table>`;
}

// ── Email functions ──────────────────────────────────────────────

/**
 * Send reservation confirmation email (reservation received).
 * Sent to the CUSTOMER after form submission.
 */
async function sendReservationReceivedEmail(to, reservation) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [to],
      subject: 'We Received Your Reservation — Amour et Grace',
      html: emailWrapper(`
        <h2>Thank You, ${escapeHtml(reservation.name)}!</h2>
        <p>We've received your reservation request. Our team will review it and confirm within <strong>24 hours</strong>.</p>
        ${reservationDetailsTable(reservation)}
        <p style="color: #666; font-size: 14px;">You'll receive another email once your reservation is confirmed or if we need to reach out.</p>
      `),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send reservation status email (accepted or rejected).
 * Sent to the CUSTOMER when admin clicks Accept/Reject.
 */
async function sendReservationStatusEmail(to, reservation, status) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  const isAccepted = status === 'accepted';
  const escapedName = escapeHtml(reservation.name);
  const formattedDate = escapeHtml(formatDateJST(reservation.date));
  const formattedTime = escapeHtml(formatTimeJST(reservation.time));

  const subject = isAccepted
    ? 'Your Reservation is Confirmed! — Amour et Grace'
    : 'Reservation Update — Amour et Grace';

  const message = isAccepted
    ? `<p>Great news! Your reservation has been <strong style="color: #2E7D32;">confirmed</strong>.</p>
       <p>We look forward to seeing you on <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
       ${reservationDetailsTable(reservation)}`
    : `<p>We're sorry, but we're unable to accommodate your reservation at this time.</p>
       <p>Please feel free to contact us to discuss alternative dates or arrangements.</p>`;

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html: emailWrapper(`
        <h2>Hello, ${escapedName}</h2>
        ${message}
      `),
    });

    if (error) {
      console.error('Status email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Status email exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Notify admin when a new reservation is submitted.
 * Sent to ADMIN_EMAIL with full reservation details.
 *
 * Includes a note about lounge physical capacity (20 people)
 * when guest count exceeds that threshold.
 */
async function sendAdminReservationNotification(reservation) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, error: 'No admin email configured' };

  const dashboardUrl = `${process.env.SITE_URL || 'https://amour-et-grace.vercel.app'}/admin/reservations.html`;

  // Warn admin if guest count exceeds physical lounge capacity
  const capacityNote = reservation.guest_count > 20
    ? `<p style="background: #FFF3E0; padding: 12px; border-radius: 4px; border-left: 4px solid #FF9800; margin: 16px 0;">
         <strong>⚠️ Note:</strong> Guest count (${escapeHtml(String(reservation.guest_count))}) exceeds the lounge's physical capacity of 20.
         Please verify with the customer.
       </p>`
    : '';

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `New Reservation — ${escapeHtml(reservation.name)} (${escapeHtml(capitalizeType(reservation.type))})`,
      html: emailWrapper(`
        <h2>New Reservation Received</h2>
        ${reservationDetailsTable(reservation, {
        showName: true,
        showEmail: true,
        showPhone: true,
        showMessage: true,
      })}
        ${capacityNote}
        <p>
          <a href="${dashboardUrl}" style="background: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View in Dashboard
          </a>
        </p>
      `),
    });

    if (error) {
      console.error('Admin reservation notification error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Admin reservation notification exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Notify admin when a new inquiry is submitted.
 */
async function sendAdminInquiryNotification(inquiry) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, error: 'No admin email configured' };

  const dashboardUrl = `${process.env.SITE_URL || 'https://amour-et-grace.vercel.app'}/admin/inquiries.html`;

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `New Inquiry — ${escapeHtml(inquiry.name)} (${escapeHtml(capitalizeType(inquiry.type))})`,
      html: emailWrapper(`
        <h2>New Inquiry Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${escapeHtml(inquiry.name)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${escapeHtml(inquiry.email)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${escapeHtml(capitalizeType(inquiry.type))}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${escapeHtml(inquiry.phone) || 'N/A'}</td></tr>
        </table>
        <p style="background: #f5f5f5; padding: 16px; border-radius: 4px;">${escapeHtml(inquiry.message)}</p>
        <p>
          <a href="${dashboardUrl}" style="background: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View in Dashboard
          </a>
        </p>
      `),
    });

    if (error) {
      console.error('Admin inquiry notification error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Admin inquiry notification exception:', err);
    return { success: false, error: err.message };
  }
}

// ── Exports ──────────────────────────────────────────────────────

module.exports = {
  sendReservationReceivedEmail,
  sendReservationStatusEmail,
  sendAdminReservationNotification,
  sendAdminInquiryNotification,
  // Exported for testing / reuse
  escapeHtml,
  formatDateJST,
  formatTimeJST,
};
