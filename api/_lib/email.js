const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@amouretgrace.com';

/**
 * Send reservation confirmation email (reservation received).
 */
async function sendReservationReceivedEmail(to, reservation) {
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

module.exports = { sendReservationReceivedEmail, sendReservationStatusEmail };
