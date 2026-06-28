/**
 * Admin Login Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  const token = typeof getToken === 'function' ? getToken() : null;
  if (token) {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit');
  const errorBox = document.getElementById('login-error');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeOffIcon = document.getElementById('eye-off-icon');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let rateLimitTimer = null;

  // ── Password visibility toggle ──

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.setAttribute('aria-pressed', isPassword.toString());

      if (isPassword) {
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
        togglePasswordBtn.setAttribute('aria-label', 'Hide password');
      } else {
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
        togglePasswordBtn.setAttribute('aria-label', 'Show password');
      }
    });
  }

  // ── Rate limit lockout ──

  function startRateLimitCooldown(retryAfterMs) {
    // Clear any existing timer
    if (rateLimitTimer) clearInterval(rateLimitTimer);

    // Lock the form
    submitBtn.disabled = true;
    emailInput.disabled = true;
    passwordInput.disabled = true;

    let remainingMs = retryAfterMs;

    function updateCountdown() {
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.ceil((remainingMs % 60000) / 1000);

      if (minutes > 0) {
        submitBtn.textContent = `Try again in ${minutes}m ${seconds}s`;
      } else {
        submitBtn.textContent = `Try again in ${seconds}s`;
      }
    }

    updateCountdown();

    rateLimitTimer = setInterval(() => {
      remainingMs -= 1000;

      if (remainingMs <= 0) {
        clearInterval(rateLimitTimer);
        rateLimitTimer = null;
        submitBtn.disabled = false;
        emailInput.disabled = false;
        passwordInput.disabled = false;
        submitBtn.textContent = 'Sign In';
        hideError();
        return;
      }

      updateCountdown();
    }, 1000);
  }

  // ── Form submission ──

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Don't allow submission during rate limit cooldown
      if (rateLimitTimer) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showError('Please enter your email and password.');
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        showError('Please enter a valid email address.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      hideError();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        // Handle rate limiting (429)
        if (res.status === 429) {
          const retryMs = data.retryAfterMs || 15 * 60 * 1000;
          showError(data.error || 'Too many login attempts. Please wait.');
          startRateLimitCooldown(retryMs);
          return;
        }

        if (!res.ok) {
          showError(data.error || 'Login failed. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
          return;
        }

        // Store token and redirect
        if (typeof setToken === 'function') setToken(data.token);
        window.location.href = '/admin/dashboard.html';
      } catch (err) {
        showError('Connection error. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // ── Error display helpers ──

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.add('show');
    }
  }

  function hideError() {
    if (errorBox) {
      errorBox.classList.remove('show');
    }
  }
});

