/**
 * Admin Inquiries Page Logic
 */
let inquiryFilter = 'all';

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
      inquiryFilter = btn.dataset.filter;
      loadInquiries();
    });
  });

  await loadInquiries();
});

async function loadInquiries() {
  const container = document.getElementById('inquiries-container');
  container.innerHTML = `<div class="admin-loading"><div class="admin-spinner"></div></div>`;

  try {
    let url = '/inquiry/admin';
    if (inquiryFilter === 'unread') url += '?read=false';
    else if (inquiryFilter === 'read') url += '?read=true';

    const res = await adminFetch(url);
    if (!res.ok) throw new Error('Failed to fetch');

    const { inquiries } = await res.json();

    if (!inquiries || inquiries.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty__icon">📭</div>
          <p class="admin-empty__text">No inquiries found</p>
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
              <th>Contact</th>
              <th>Message</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inquiries.map((inq) => renderInquiryRow(inq)).join('')}
          </tbody>
        </table>
      </div>`;

    attachInquiryActions();
  } catch (err) {
    console.error('Error loading inquiries:', err);
    container.innerHTML = `<p style="color: var(--admin-text-muted); padding: 16px;">Failed to load inquiries. Please refresh.</p>`;
  }
}

function renderInquiryRow(inq) {
  const statusBadge = inq.is_read
    ? `<span class="badge badge--read">Read</span>`
    : `<span class="badge badge--unread">New</span>`;

  const rowStyle = inq.is_read ? '' : 'font-weight: 500;';

  return `
    <tr id="inq-row-${inq.id}" style="${rowStyle}">
      <td><strong>${escapeHtml(inq.name)}</strong></td>
      <td style="text-transform: capitalize;">${escapeHtml(inq.type)}</td>
      <td>
        <span style="font-size: 13px;">${escapeHtml(inq.email)}</span>
        ${inq.phone ? `<br><span style="color: var(--admin-text-muted); font-size: 12px;">${escapeHtml(inq.phone)}</span>` : ''}
      </td>
      <td style="max-width: 280px;">
        <span style="color: var(--admin-accent); font-size: 13px; cursor: pointer;" onclick="toggleInquiryMsg('inq-msg-${inq.id}')">
          ${inq.is_read ? '📄' : '📬'} ${inq.is_read ? 'View' : 'Read message'}
        </span>
        <div id="inq-msg-${inq.id}" class="inquiry-message">${escapeHtml(inq.message)}</div>
      </td>
      <td>${statusBadge}</td>
      <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDateTime(inq.created_at)}</td>
      <td>
        ${!inq.is_read
      ? `<button class="btn btn--primary btn--sm" data-id="${inq.id}" data-read="true">Mark Read</button>`
      : `<button class="btn btn--secondary btn--sm" data-id="${inq.id}" data-read="false">Mark Unread</button>`
    }
      </td>
    </tr>`;
}

function attachInquiryActions() {
  document.querySelectorAll('[data-read]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const is_read = btn.dataset.read === 'true';

      // Auto-expand message when marking as read
      if (is_read) {
        const msgEl = document.getElementById(`inq-msg-${id}`);
        if (msgEl) msgEl.classList.add('show');
      }

      await markInquiry(id, is_read);
    });
  });
}

async function markInquiry(id, is_read) {
  try {
    const res = await adminFetch('/inquiry/admin', {
      method: 'PATCH',
      body: JSON.stringify({ id, is_read }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Failed to update inquiry', 'error');
      return;
    }

    showToast(is_read ? 'Marked as read' : 'Marked as unread', 'success');
    await loadInquiries();
  } catch (err) {
    console.error('Mark inquiry error:', err);
    showToast('Error updating inquiry', 'error');
  }
}

function toggleInquiryMsg(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show');
}
