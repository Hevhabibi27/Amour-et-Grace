/**
 * Admin shared utilities.
 * Auth guard, token management, fetch wrapper, toast notifications.
 */

const API_BASE = '/api';

// ── Token Management ──

function getToken() {
  return localStorage.getItem('admin_token');
}

function setToken(token) {
  localStorage.setItem('admin_token', token);
}

function clearToken() {
  localStorage.removeItem('admin_token');
}

// ── Auth Guard ──
// Call this at the top of every protected page.
// Redirects to login if no token, or if token is invalid.

async function authGuard() {
  const token = getToken();
  if (!token) {
    window.location.href = '/admin/index.html';
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      clearToken();
      window.location.href = '/admin/index.html';
      return false;
    }

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error('Auth guard error:', err);
    clearToken();
    window.location.href = '/admin/index.html';
    return false;
  }
}

// ── Authenticated Fetch Wrapper ──
// Automatically adds the Authorization header and handles 401s.

async function adminFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/admin/index.html';
    throw new Error('No token');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/admin/index.html';
    throw new Error('Session expired');
  }

  return res;
}

// ── Logout ──

function logout() {
  clearToken();
  window.location.href = '/admin/index.html';
}

// ── Toast Notifications ──

function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.admin-toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ── Date Formatting ──

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Star Rating HTML ──

function starsHtml(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// ── Mobile Sidebar Toggle ──

function initSidebar() {
  const hamburger = document.getElementById('admin-hamburger');
  const sidebar = document.getElementById('admin-sidebar');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== hamburger
      ) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// ── Set Active Nav Link ──

function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.admin-sidebar__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
  });
}
