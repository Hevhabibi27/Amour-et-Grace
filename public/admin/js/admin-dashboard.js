/**
 * Admin Dashboard Overview Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  const user = await authGuard();
  if (!user) return;

  // Show user email in topbar
  const userEl = document.getElementById('admin-user');
  if (userEl) userEl.textContent = user.email;

  // Setup sidebar & nav
  initSidebar();
  setActiveNav();

  // Setup logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Load dashboard stats
  await loadStats();
  await loadRecentReservations();
});

async function loadStats() {
  try {
    // Load counts in parallel
    const [resRes, inqRes, revRes] = await Promise.all([
      adminFetch('/reservations/admin?status=pending'),
      adminFetch('/inquiry/admin?read=false'),
      adminFetch('/reviews/admin'),
    ]);

    const resData = resRes.ok ? await resRes.json() : { reservations: [] };
    const inqData = inqRes.ok ? await inqRes.json() : { inquiries: [] };
    const revData = revRes.ok ? await revRes.json() : { reviews: [] };

    const pendingReservations = resData.reservations?.length || 0;
    const unreadInquiries = inqData.inquiries?.length || 0;
    const totalReviews = revData.reviews?.length || 0;

    // Update stat cards
    const el = (id) => document.getElementById(id);
    if (el('stat-reservations')) el('stat-reservations').textContent = pendingReservations;
    if (el('stat-inquiries')) el('stat-inquiries').textContent = unreadInquiries;
    if (el('stat-reviews')) el('stat-reviews').textContent = totalReviews;

    // Update sidebar badges
    if (pendingReservations > 0) {
      const badge = document.getElementById('badge-reservations');
      if (badge) { badge.textContent = pendingReservations; badge.style.display = 'inline'; }
    }
    if (unreadInquiries > 0) {
      const badge = document.getElementById('badge-inquiries');
      if (badge) { badge.textContent = unreadInquiries; badge.style.display = 'inline'; }
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadRecentReservations() {
  const container = document.getElementById('recent-reservations');
  if (!container) return;

  try {
    const res = await adminFetch('/reservations/admin?limit=5');
    if (!res.ok) throw new Error('Failed to fetch');

    const { reservations } = await res.json();

    if (!reservations || reservations.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty__icon">📅</div>
          <p class="admin-empty__text">No reservations yet</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${reservations.map((r) => `
              <tr>
                <td><strong>${escapeHtml(r.name)}</strong><br><span style="color: var(--admin-text-muted); font-size: 12px;">${escapeHtml(r.email)}</span></td>
                <td style="text-transform: capitalize;">${escapeHtml(r.type)}</td>
                <td>${escapeHtml(r.date)} at ${escapeHtml(r.time)}</td>
                <td>${r.guest_count}</td>
                <td><span class="badge badge--${r.status}">${escapeHtml(r.status)}</span></td>
                <td>${formatDateTime(r.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    console.error('Error loading recent reservations:', err);
    container.innerHTML = `<p style="color: var(--admin-text-muted); padding: 16px;">Failed to load reservations.</p>`;
  }
}
