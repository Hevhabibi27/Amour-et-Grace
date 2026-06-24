// public/js/chatbot.js
// Self-contained floating AI chat widget for Amour et Grâce
// Injects its own DOM — no manual HTML markup needed.

(function () {
  'use strict';

  // ── Config ──
  const API_URL = '/api/chat';
  const MAX_CHARS = 500;
  const STORAGE_KEY = 'aeg_chat_ratelimit';
  const HISTORY_KEY = 'aeg_chat_history';
  const MAX_HISTORY = 50; // max messages to keep in sessionStorage

  // ── State ──
  let isOpen = false;
  let isWaiting = false;
  let isRateLimited = false;
  let remaining = null; // null = unknown yet

  // ── Build DOM ──
  function buildWidget() {
    // --- FAB Button ---
    const fab = document.createElement('button');
    fab.className = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.id = 'chatbot-fab';
    fab.innerHTML = `
      <svg class="chatbot-fab-icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
        <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
      </svg>
      <svg class="chatbot-fab-icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;

    // --- Panel ---
    const panel = document.createElement('div');
    panel.className = 'chatbot-panel';
    panel.id = 'chatbot-panel';
    panel.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-avatar">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div class="chatbot-header-info">
          <div class="chatbot-header-title">Amour et Grâce</div>
          <div class="chatbot-header-subtitle">AI Assistant · Ask about our menu & more</div>
        </div>
        <button class="chatbot-close-btn" id="chatbot-close-btn" aria-label="Close chat">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chatbot-msg ai">
          Hello! 👋 Welcome to Amour et Grâce. I can help you with our menu, hours, reservations, and events. What would you like to know?
        </div>
      </div>
      <div class="chatbot-rate-limit" id="chatbot-rate-limit">
        <p>⏳ You've reached the message limit. Please try again later.</p>
      </div>
      <div class="chatbot-input-area">
        <input
          type="text"
          class="chatbot-input"
          id="chatbot-input"
          placeholder="Ask about our menu, hours, events..."
          maxlength="${MAX_CHARS}"
          autocomplete="off"
          spellcheck="true"
        />
        <span class="chatbot-char-count" id="chatbot-char-count"></span>
        <button class="chatbot-send-btn" id="chatbot-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    return { fab, panel };
  }

  // ── Sanitize input (client-side) ──
  // Light sanitize: strips HTML tags only (preserves trailing spaces for typing)
  function sanitizeForInput(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/<[^>]*>/g, '');
  }

  // Full sanitize: strips HTML + trims (used at send time)
  function sanitizeForSend(raw) {
    if (typeof raw !== 'string') return '';
    let text = raw.replace(/<[^>]*>/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  // ── Rate limit persistence ──
  function saveRateLimitState(rateLimited, remainingCount, retryAfterMs) {
    try {
      const data = {
        rateLimited,
        remaining: remainingCount,
        expiresAt: rateLimited ? Date.now() + (retryAfterMs || 3600000) : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) { /* localStorage unavailable */ }
  }

  function loadRateLimitState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Check if the rate limit has expired
      if (data.rateLimited && data.expiresAt && Date.now() >= data.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch (_) {
      return null;
    }
  }

  // ── Chat history persistence (session only) ──
  function saveChatHistory(messages) {
    try {
      // Keep only the last MAX_HISTORY messages
      const trimmed = messages.slice(-MAX_HISTORY);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (_) { /* sessionStorage unavailable */ }
  }

  function loadChatHistory() {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  // ── Render a message bubble ──
  function addMessage(container, text, role) {
    const div = document.createElement('div');
    div.className = `chatbot-msg ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  // ── Typing indicator ──
  function showTyping(container) {
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbot-typing';
    typing.innerHTML = `
      <div class="chatbot-typing-dot"></div>
      <div class="chatbot-typing-dot"></div>
      <div class="chatbot-typing-dot"></div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return typing;
  }

  function hideTyping() {
    const el = document.getElementById('chatbot-typing');
    if (el) el.remove();
  }

  // ── UI lock/unlock ──
  function lockUI(input, sendBtn, rateLimitBanner) {
    isRateLimited = true;
    input.classList.add('disabled');
    input.disabled = true;
    input.placeholder = 'Message limit reached';
    sendBtn.classList.add('disabled');
    rateLimitBanner.classList.add('visible');
  }

  function unlockUI(input, sendBtn, rateLimitBanner) {
    isRateLimited = false;
    input.classList.remove('disabled');
    input.disabled = false;
    input.placeholder = 'Ask about our menu, hours, events...';
    sendBtn.classList.remove('disabled');
    rateLimitBanner.classList.remove('visible');
  }

  // ── Initialize ──
  function init() {
    const { fab, panel } = buildWidget();
    const messagesEl = document.getElementById('chatbot-messages');
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const charCount = document.getElementById('chatbot-char-count');
    const rateLimitBanner = document.getElementById('chatbot-rate-limit');

    // Track messages for session persistence
    let chatMessages = [];

    // ── Restore chat history from sessionStorage ──
    const savedHistory = loadChatHistory();
    if (savedHistory && savedHistory.length > 0) {
      // Clear the default welcome message
      messagesEl.innerHTML = '';
      savedHistory.forEach(function (msg) {
        addMessage(messagesEl, msg.text, msg.role);
      });
      chatMessages = savedHistory;
    }

    // ── Restore rate limit state ──
    const savedRL = loadRateLimitState();
    if (savedRL && savedRL.rateLimited) {
      remaining = 0;
      lockUI(inputEl, sendBtn, rateLimitBanner);
    }

    // ── Close helper ──
    function closeChat() {
      isOpen = false;
      fab.classList.remove('open');
      panel.classList.remove('visible');
      fab.setAttribute('aria-label', 'Open chat');
    }

    // ── FAB toggle ──
    fab.addEventListener('click', function () {
      isOpen = !isOpen;
      fab.classList.toggle('open', isOpen);
      panel.classList.toggle('visible', isOpen);
      fab.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
      if (isOpen && !isRateLimited) {
        inputEl.focus();
      }
    });

    // ── Header close button (visible on mobile) ──
    const closeBtn = document.getElementById('chatbot-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeChat);
    }

    // ── Character count ──
    inputEl.addEventListener('input', function () {
      // Light sanitize only — strip HTML but preserve spaces
      const raw = inputEl.value;
      const clean = sanitizeForInput(raw);
      if (clean !== raw) {
        const cursorPos = inputEl.selectionStart;
        inputEl.value = clean;
        inputEl.selectionStart = inputEl.selectionEnd = cursorPos;
      }

      const len = clean.length;
      if (len === 0) {
        charCount.textContent = '';
        charCount.className = 'chatbot-char-count';
      } else {
        charCount.textContent = `${len}/${MAX_CHARS}`;
        if (len >= MAX_CHARS) {
          charCount.className = 'chatbot-char-count limit';
        } else if (len >= MAX_CHARS * 0.8) {
          charCount.className = 'chatbot-char-count warn';
        } else {
          charCount.className = 'chatbot-char-count';
        }
      }
    });

    // ── Block paste of non-text content ──
    inputEl.addEventListener('paste', function (e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
      const clean = sanitizeForInput(text);
      // Truncate to remaining chars
      const currentLen = inputEl.value.length;
      const allowed = MAX_CHARS - currentLen;
      if (allowed <= 0) return;
      const toInsert = clean.substring(0, allowed);

      // Insert at cursor position
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const before = inputEl.value.substring(0, start);
      const after = inputEl.value.substring(end);
      inputEl.value = before + toInsert + after;
      inputEl.selectionStart = inputEl.selectionEnd = start + toInsert.length;

      // Trigger input event for char count update
      inputEl.dispatchEvent(new Event('input'));
    });

    // ── Block drag-and-drop ──
    inputEl.addEventListener('drop', function (e) {
      e.preventDefault();
    });
    inputEl.addEventListener('dragover', function (e) {
      e.preventDefault();
    });

    // ── Send message ──
    async function sendMessage() {
      if (isWaiting || isRateLimited) return;

      const text = sanitizeForSend(inputEl.value);
      if (!text) return;

      // Clear input
      inputEl.value = '';
      charCount.textContent = '';
      charCount.className = 'chatbot-char-count';

      // Show user message
      addMessage(messagesEl, text, 'user');
      chatMessages.push({ text, role: 'user' });

      // Show typing indicator
      isWaiting = true;
      sendBtn.classList.add('disabled');
      const typingEl = showTyping(messagesEl);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });

        const data = await response.json();

        // Remove typing indicator
        hideTyping();

        if (response.status === 429 || data.rateLimited) {
          // Rate limited
          remaining = 0;
          saveRateLimitState(true, 0, data.retryAfterMs);
          lockUI(inputEl, sendBtn, rateLimitBanner);

          addMessage(messagesEl, data.error || 'You\'ve reached the message limit. Please try again later.', 'ai');
          chatMessages.push({ text: data.error || 'You\'ve reached the message limit. Please try again later.', role: 'ai' });
        } else if (response.ok && data.reply) {
          // Success
          remaining = data.remaining;
          saveRateLimitState(false, data.remaining);

          addMessage(messagesEl, data.reply, 'ai');
          chatMessages.push({ text: data.reply, role: 'ai' });

          // Check if we're about to hit the limit
          if (data.remaining !== undefined && data.remaining <= 0) {
            lockUI(inputEl, sendBtn, rateLimitBanner);
            saveRateLimitState(true, 0);
          }
        } else {
          // API error
          const errMsg = data.error || 'Something went wrong. Please try again.';
          addMessage(messagesEl, errMsg, 'ai');
          chatMessages.push({ text: errMsg, role: 'ai' });

          if (data.remaining !== undefined) {
            remaining = data.remaining;
          }
        }
      } catch (err) {
        hideTyping();
        const errMsg = 'Unable to connect. Please check your internet and try again.';
        addMessage(messagesEl, errMsg, 'ai');
        chatMessages.push({ text: errMsg, role: 'ai' });
      } finally {
        isWaiting = false;
        if (!isRateLimited) {
          sendBtn.classList.remove('disabled');
        }
        // Persist chat history
        saveChatHistory(chatMessages);
      }
    }

    // ── Event listeners for send ──
    sendBtn.addEventListener('click', function () {
      if (!sendBtn.classList.contains('disabled')) {
        sendMessage();
      }
    });

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // ── Close on Escape ──
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });
  }

  // ── Boot ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
