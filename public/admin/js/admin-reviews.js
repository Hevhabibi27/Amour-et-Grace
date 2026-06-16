/**
 * Admin Reviews Page Logic
 */
let reviewFilter = 'all';

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
      reviewFilter = btn.dataset.filter;
      loadReviews();
    });
  });

  await loadReviews();
});

async function loadReviews() {
  const container = document.getElementById('reviews-container');
  container.innerHTML = `<div class="admin-loading"><div class="admin-spinner"></div></div>`;

  try {
    let url = '/reviews/admin';
    if (reviewFilter === 'approved') url += '?approved=true';
    else if (reviewFilter === 'unapproved') url += '?approved=false';

    const res = await adminFetch(url);
    if (!res.ok) throw new Error('Failed to fetch');

    const { reviews } = await res.json();

    if (!reviews || reviews.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty__icon">⭐</div>
          <p class="admin-empty__text">No reviews found</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reviews.map((r) => renderReviewRow(r)).join('')}
          </tbody>
        </table>
      </div>`;

    attachReviewActions();
  } catch (err) {
    console.error('Error loading reviews:', err);
    container.innerHTML = `<p style="color: var(--admin-text-muted); padding: 16px;">Failed to load reviews. Please refresh.</p>`;
  }
}

function renderReviewRow(r) {
  const statusBadge = r.is_approved
    ? `<span class="badge badge--approved">Approved</span>`
    : `<span class="badge badge--rejected">Hidden</span>`;

  const toggleLabel = r.is_approved ? 'Hide' : 'Approve';
  const toggleClass = r.is_approved ? 'btn--reject' : 'btn--accept';

  return `
    <tr id="review-row-${r.id}">
      <td><strong>${r.name}</strong></td>
      <td><span class="stars">${starsHtml(r.rating)}</span><br><span style="font-size:12px; color: var(--admin-text-muted);">${r.rating}/5</span></td>
      <td style="max-width: 300px;">${r.comment || '<span style="color: var(--admin-text-muted);">No comment</span>'}</td>
      <td>${statusBadge}</td>
      <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDateTime(r.created_at)}</td>
      <td>
        <button class="btn ${toggleClass} btn--sm" data-id="${r.id}" data-approved="${!r.is_approved}">${toggleLabel}</button>
        <button class="btn btn--secondary btn--sm" data-id="${r.id}" data-delete="true" style="margin-left: 6px;">Delete</button>
      </td>
    </tr>`;
}

function attachReviewActions() {
  // Toggle approve/hide
  document.querySelectorAll('[data-approved]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const is_approved = btn.dataset.approved === 'true';
      await updateReview(id, { is_approved });
    });
  });

  // Delete
  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this review permanently?')) return;
      await deleteReview(btn.dataset.id);
    });
  });
}

async function updateReview(id, updates) {
  try {
    const res = await adminFetch('/reviews/admin', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Failed to update review', 'error');
      return;
    }

    showToast(updates.is_approved ? 'Review approved ✅' : 'Review hidden', 'success');
    await loadReviews();
  } catch (err) {
    console.error('Update review error:', err);
    showToast('Error updating review', 'error');
  }
}

async function deleteReview(id) {
  try {
    const res = await adminFetch('/reviews/admin', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      showToast('Failed to delete review', 'error');
      return;
    }

    showToast('Review deleted', 'success');
    await loadReviews();
  } catch (err) {
    console.error('Delete review error:', err);
    showToast('Error deleting review', 'error');
  }
}
