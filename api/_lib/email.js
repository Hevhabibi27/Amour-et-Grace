const { Resend } = require('resend');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@amouretgrace.com';

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
 * Send reservation confirmation email (reservation received).
 */
async function sendReservationReceivedEmail(to, reservation) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [to],
      subject: 'We Received Your Reservation — Amour et Grace',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8B6914; font-family: 'Playfair Display', Georgia, serif;">Amour et Grace</h1>
          <hr style="border: 1px solid #E8D5A3;">
          <h2>Thank You, ${reservation.name}!</h2>
          <p>We've received your reservation request. Our team will review it and confirm within <strong>24 hours</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${reservation.type}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${reservation.date}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${reservation.time}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Guests</td><td style="padding: 8px;">${reservation.guest_count}</td></tr>
          </table>
          <p style="color: #666; font-size: 14px;">You'll receive another email once your reservation is confirmed or if we need to reach out.</p>
          <hr style="border: 1px solid #E8D5A3;">
          <p style="color: #999; font-size: 12px;">Amour et Grace — Where love meets grace</p>
        </div>
      `,
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
 */
async function sendReservationStatusEmail(to, reservation, status) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  const isAccepted = status === 'accepted';

  const subject = isAccepted
    ? 'Your Reservation is Confirmed! — Amour et Grace'
    : 'Reservation Update — Amour et Grace';

  const message = isAccepted
    ? `<p>Great news! Your reservation has been <strong style="color: #2E7D32;">confirmed</strong>.</p>
       <p>We look forward to seeing you on <strong>${reservation.date}</strong> at <strong>${reservation.time}</strong>.</p>`
    : `<p>We're sorry, but we're unable to accommodate your reservation at this time.</p>
       <p>Please feel free to contact us to discuss alternative dates or arrangements.</p>`;

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8B6914; font-family: 'Playfair Display', Georgia, serif;">Amour et Grace</h1>
          <hr style="border: 1px solid #E8D5A3;">
          <h2>Hello, ${reservation.name}</h2>
          ${message}
          <hr style="border: 1px solid #E8D5A3;">
          <p style="color: #999; font-size: 12px;">Amour et Grace — Where love meets grace</p>
        </div>
      `,
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
 */
async function sendAdminReservationNotification(reservation) {
  const resend = getResend();
  if (!resend) return { success: false, error: 'Email not configured' };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, error: 'No admin email configured' };

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `New Reservation — ${reservation.name} (${reservation.type})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8B6914; font-family: 'Playfair Display', Georgia, serif;">New Reservation</h1>
          <hr style="border: 1px solid #E8D5A3;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${reservation.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${reservation.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${reservation.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${reservation.type}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${reservation.date}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${reservation.time}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Guests</td><td style="padding: 8px;">${reservation.guest_count}</td></tr>
            ${reservation.message ? `<tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${reservation.message}</td></tr>` : ''}
          </table>
          <p><a href="${process.env.SITE_URL || 'https://amour-et-grace.vercel.app'}/admin/reservations.html" style="background: #8B6914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Dashboard</a></p>
          <hr style="border: 1px solid #E8D5A3;">
          <p style="color: #999; font-size: 12px;">Amour et Grace — Admin Notification</p>
        </div>
      `,
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

  try {
    const { data, error } = await resend.emails.send({
      from: `Amour et Grace <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `New Inquiry — ${inquiry.name} (${inquiry.type})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8B6914; font-family: 'Playfair Display', Georgia, serif;">New Inquiry</h1>
          <hr style="border: 1px solid #E8D5A3;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${inquiry.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${inquiry.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${inquiry.type}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${inquiry.phone || 'N/A'}</td></tr>
          </table>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 4px;">${inquiry.message}</p>
          <p><a href="${process.env.SITE_URL || 'https://amouretgrace.vercel.app'}/admin/inquiries.html" style="background: #8B6914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Dashboard</a></p>
          <hr style="border: 1px solid #E8D5A3;">
          <p style="color: #999; font-size: 12px;">Amour et Grace — Admin Notification</p>
        </div>
      `,
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

module.exports = { sendReservationReceivedEmail, sendReservationStatusEmail, sendAdminReservationNotification, sendAdminInquiryNotification };
