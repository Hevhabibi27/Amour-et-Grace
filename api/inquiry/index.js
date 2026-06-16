const { supabaseAdmin } = require('../_lib/supabase');
const { validateRequired, isValidEmail, sanitize } = require('../_lib/validate');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');
const { sendAdminInquiryNotification } = require('../_lib/email');

/**
 * POST /api/inquiry
 * Customer submits an inquiry.
 * Notifies admin via email.
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const { allowed, remaining, retryAfterMs } = await checkRateLimit(ip, '/api/inquiry');
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many inquiries. Please try again later.',
      retryAfterMs,
    });
  }

  // Validate required fields
  const { valid, missing } = validateRequired(req.body, ['type', 'name', 'email', 'message']);
  if (!valid) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const { type, name, email, phone, message } = req.body;

  // Validate inquiry type
  const validTypes = ['general', 'event', 'party', 'catering'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid inquiry type. Must be one of: ${validTypes.join(', ')}` });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const inquiry = {
      type: sanitize(type),
      name: sanitize(name),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : null,
      message: sanitize(message),
      is_read: false,
      ip_address: ip,
    };

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .insert(inquiry)
      .select()
      .single();

    if (error) {
      console.error('Inquiry insert error:', error);
      return res.status(500).json({ error: 'Failed to save inquiry' });
    }

    // Notify admin (non-blocking)
    sendAdminInquiryNotification(data).catch((err) => {
      console.error('Admin inquiry notification failed:', err);
    });

    return res.status(201).json({
      message: 'Inquiry submitted successfully. We will get back to you soon!',
      inquiry: {
        id: data.id,
        type: data.type,
      },
      remaining,
    });
  } catch (err) {
    console.error('Inquiry submit exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
