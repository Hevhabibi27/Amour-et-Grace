/**
 * Admin Reservations Page Logic
 */
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await authGuard();
  if (!user) return;

  const userEl = document.getElementById('admin-user');
  if (userEl) userEl.textContent = user.email;

  initSidebar();
  setActiveNav();
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Filter buttons
  document.querySelectorAll('.admin-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadReservations();
    });
  });

  await loadReservations();
});

async function loadReservations() {
  const container = document.getElementById('reservations-container');
  container.innerHTML = `<div class="admin-loading"><div class="admin-spinner"></div></div>`;

  try {
    const url = currentFilter === 'all'
      ? '/reservations/admin'
      : `/reservations/admin?status=${currentFilter}`;

    const res = await adminFetch(url);
    if (!res.ok) throw new Error('Failed to fetch');

    const { reservations } = await res.json();

    if (!reservations || reservations.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty__icon">📭</div>
          <p class="admin-empty__text">No ${currentFilter === 'all' ? '' : currentFilter} reservations found</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reservations-tbody">
            ${reservations.map((r) => renderReservationRow(r)).join('')}
          </tbody>
        </table>
      </div>`;

    // Attach action listeners
    attachReservationActions();
  } catch (err) {
    console.error('Error loading reservations:', err);
    container.innerHTML = `<p style="color: var(--admin-text-muted); padding: 16px;">Failed to load reservations. Please refresh.</p>`;
  }
}

function renderReservationRow(r) {
  const isPending = r.status === 'pending';
  const emailStatus = r.email_status_sent
    ? `<span style="color: var(--admin-success); font-size: 12px;">✅ Sent</span>`
    : `<span style="color: var(--admin-text-muted); font-size: 12px;">—</span>`;

  const actions = isPending
    ? `<button class="btn btn--accept btn--sm" data-id="${r.id}" data-action="accepted">Accept</button>
       <button class="btn btn--reject btn--sm" data-id="${r.id}" data-action="rejected" style="margin-left: 6px;">Reject</button>`
    : `<span style="color: var(--admin-text-muted); font-size: 12px;">Done</span>`;

  return `
    <tr id="row-${r.id}">
      <td>
        <strong>${r.name}</strong><br>
        <span style="color: var(--admin-text-muted); font-size: 12px;">${r.email}</span>
        ${r.phone ? `<br><span style="color: var(--admin-text-muted); font-size: 12px;">${r.phone}</span>` : ''}
        ${r.message ? `<br><span style="color: var(--admin-accent); font-size: 12px; cursor: pointer;" onclick="toggleMessage('msg-${r.id}')">📝 View note</span><div id="msg-${r.id}" class="inquiry-message">${r.message}</div>` : ''}
      </td>
      <td style="text-transform: capitalize;">${r.type}</td>
      <td>${r.date}<br><span style="color: var(--admin-text-muted); font-size: 12px;">${r.time}</span></td>
      <td>${r.guest_count}</td>
      <td><span class="badge badge--${r.status}">${r.status}</span></td>
      <td>${emailStatus}</td>
      <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDateTime(r.created_at)}</td>
      <td>${actions}</td>
    </tr>`;
}

function attachReservationActions() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { id, action } = btn.dataset;
      await updateReservationStatus(id, action, btn);
    });
  });
}

async function updateReservationStatus(id, status, btn) {
  // Disable buttons in this row
  const row = document.getElementById(`row-${id}`);
  row?.querySelectorAll('button').forEach((b) => (b.disabled = true));

  try {
    const res = await adminFetch('/reservations/admin', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Failed to update reservation', 'error');
      row?.querySelectorAll('button').forEach((b) => (b.disabled = false));
      return;
    }

    showToast(`Reservation ${status}! ${data.emailSent ? 'Email sent to guest.' : 'Note: Email not sent.'}`, 'success');
    // Reload to reflect new status
    await loadReservations();
  } catch (err) {
    console.error('Update error:', err);
    showToast('Error updating reservation', 'error');
    row?.querySelectorAll('button').forEach((b) => (b.disabled = false));
  }
}

function toggleMessage(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show');
}
