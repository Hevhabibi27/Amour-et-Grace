const Groq = require('groq-sdk');
const { checkRateLimit, getClientIp } = require('../_lib/rate-limiter');
const { SYSTEM_PROMPT } = require('../_lib/persona');

/**
 * /api/chat
 * POST — Send a message to the Groq AI chatbot
 *
 * Request body:  { message: string }
 * Response body: { reply: string, remaining: number, rateLimited: boolean }
 *
 * Rate limit: configured in api/_lib/rate-limiter.js under '/api/chat'
 */

// ── Groq client (lazy singleton) ──
let groqClient = null;
function getGroq() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ── Input sanitization ──
const MAX_MESSAGE_LENGTH = 500;
const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_PATTERN = /(\b(javascript|on\w+)\s*[:=]|<\s*script|<\s*iframe|<\s*object|<\s*embed)/i;

/**
 * Sanitize and validate user input.
 * Returns { valid: boolean, sanitized?: string, error?: string }
 */
function sanitizeInput(raw) {
  if (typeof raw !== 'string') {
    return { valid: false, error: 'Message must be a text string.' };
  }

  // Strip HTML tags
  let cleaned = raw.replace(HTML_TAG_REGEX, '');

  // Trim whitespace
  cleaned = cleaned.trim();

  if (cleaned.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }

  if (cleaned.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` };
  }

  // Check for script injection patterns
  if (SCRIPT_PATTERN.test(cleaned)) {
    return { valid: false, error: 'Message contains disallowed content.' };
  }

  return { valid: true, sanitized: cleaned };
}

// ── Main handler ──
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Rate limit check ──
  const ip = getClientIp(req);
  const { allowed, remaining, retryAfterMs } = await checkRateLimit(ip, '/api/chat');

  if (!allowed) {
    return res.status(429).json({
      error: 'You\'ve reached the message limit. Please try again later.',
      rateLimited: true,
      remaining: 0,
      retryAfterMs: retryAfterMs || 3600000,
    });
  }

  // ── Validate input ──
  const { message } = req.body || {};
  const { valid, sanitized, error: inputError } = sanitizeInput(message);

  if (!valid) {
    return res.status(400).json({ error: inputError, rateLimited: false, remaining });
  }

  // ── Call Groq API ──
  try {
    const groq = getGroq();

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: sanitized },
      ],
      temperature: 0.7,
      max_tokens: 512,
      top_p: 0.9,
    });

    const reply = chatCompletion.choices?.[0]?.message?.content
      || 'Sorry, I couldn\'t process your request. Please try again.';

    return res.status(200).json({
      reply,
      remaining,
      rateLimited: false,
    });
  } catch (err) {
    console.error('Groq API error:', err);

    // Distinguish between API key issues and other errors
    if (err.status === 401 || err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Chatbot is temporarily unavailable. Please try again later.',
        rateLimited: false,
        remaining,
      });
    }

    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      rateLimited: false,
      remaining,
    });
  }
};
