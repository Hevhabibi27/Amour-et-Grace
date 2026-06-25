// public/js/reviews.js
// ── Reviews Feature — Live Supabase Integration ──
// Text-only reviews with admin approval, rate limiting, and input guards.

(function () {
    'use strict';

    // ── Configuration ──
    const API_URL = '/api/reviews';
    const REVIEWS_PER_PAGE = 6;

    // ── State ──
    let allReviews = [];       // Full fetched array (approved only)
    let displayedCount = 0;    // How many are currently rendered
    let currentSort = 'newest';
    let hasFetched = false;     // Prevent duplicate fetches

    // ── Input Sanitization Guard ──
    // Strips HTML tags, script injections, and suspicious patterns from user input.
    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/<[^>]*>?/gm, '')          // Strip all HTML tags
            .replace(/javascript\s*:/gi, '')     // Strip javascript: protocol
            .replace(/on\w+\s*=/gi, '')          // Strip inline event handlers
            .replace(/data\s*:[^,]*,/gi, '')     // Strip data: URIs
            .replace(/&#/g, '')                  // Strip HTML entities (numeric)
            .replace(/\\x[0-9a-f]{2}/gi, '')     // Strip hex escape sequences
            .trim();
    }

    // Detects if input contains suspicious content
    function isSuspicious(str) {
        if (typeof str !== 'string') return false;
        const patterns = [
            /<script/i,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /<link/i,
            /data\s*:text\/html/i,
            /eval\s*\(/i,
            /document\s*\./i,
            /window\s*\./i,
            /\.exe\b/i,
            /\.bat\b/i,
            /\.cmd\b/i,
            /\.ps1\b/i,
        ];
        return patterns.some(p => p.test(str));
    }

    // ── Helpers ──
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }

    function generateStarsHtml(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += i <= rating
                ? '<span class="star filled">\u2605</span>'
                : '<span class="star">\u2605</span>';
        }
        return html;
    }

    function getInitials(name) {
        return name
            .split(/\s+/)
            .map(w => w.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    // ── Render a single review card ──
    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-item-card';
        card.innerHTML = `
      <div class="review-item-stars">
        ${generateStarsHtml(review.rating)}
      </div>
      <p class="review-item-text">
        "${escapeHtml(review.comment || '')}"
      </p>
      <div class="review-item-author">
        <div class="author-avatar-placeholder">${escapeHtml(getInitials(review.name))}</div>
        <div class="author-details">
          <span class="author-name">${escapeHtml(review.name)}</span>
          <span class="author-date">${formatDate(review.created_at)}</span>
        </div>
      </div>
    `;
        return card;
    }

    // ── Update Summary Stats ──
    function updateSummaryCard(reviews) {
        const scoreEl = document.getElementById('overall-score');
        const starsEl = document.getElementById('overall-stars');
        const countEl = document.getElementById('reviews-total-count');

        if (!scoreEl) return; // Page not loaded yet

        const total = reviews.length;

        if (total === 0) {
            scoreEl.textContent = '\u2014';
            starsEl.innerHTML = '<span style="color:#dcdcdc;">\u2605\u2605\u2605\u2605\u2605</span>';
            countEl.textContent = 'NO REVIEWS YET';

            for (let i = 1; i <= 5; i++) {
                const bar = document.getElementById(`bar-${i}`);
                const pct = document.getElementById(`pct-${i}`);
                if (bar) bar.style.width = '0%';
                if (pct) pct.textContent = '0%';
            }
            return;
        }

        // Calculate average
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / total).toFixed(1);
        scoreEl.textContent = avg;
        countEl.textContent = `${total} VERIFIED REVIEW${total !== 1 ? 'S' : ''}`;

        // Render overall stars
        const roundedAvg = Math.round(parseFloat(avg));
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= roundedAvg
                ? '\u2605'
                : '<span style="color:#dcdcdc;">\u2605</span>';
        }
        starsEl.innerHTML = starsHtml;

        // Rating distribution bars
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });

        for (let i = 1; i <= 5; i++) {
            const percentage = Math.round((counts[i] / total) * 100);
            const bar = document.getElementById(`bar-${i}`);
            const pct = document.getElementById(`pct-${i}`);
            if (bar) bar.style.width = `${percentage}%`;
            if (pct) pct.textContent = `${percentage}%`;
        }
    }

    // ── Sort Reviews ──
    function sortReviews(reviews, sortBy) {
        const sorted = [...reviews];
        switch (sortBy) {
            case 'highest':
                sorted.sort((a, b) => b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'lowest':
                sorted.sort((a, b) => a.rating - b.rating || new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        return sorted;
    }

    // ── Render Reviews Grid ──
    function renderReviews(showAll) {
        const container = document.getElementById('reviews-grid-container');
        const countSpan = document.getElementById('displayed-reviews-count');
        const loadMoreBtn = document.getElementById('btnLoadMoreReviews');
        const showLessBtn = document.getElementById('btnShowLessReviews');
        const loadingEl = document.getElementById('reviews-loading');

        if (!container) return;

        // Hide loading spinner
        if (loadingEl) loadingEl.style.display = 'none';

        // Clear existing cards (not the loading spinner)
        container.querySelectorAll('.review-item-card').forEach(c => c.remove());

        const sorted = sortReviews(allReviews, currentSort);
        const limit = showAll ? sorted.length : REVIEWS_PER_PAGE;
        const toShow = sorted.slice(0, limit);

        if (toShow.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'review-item-card';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.gridColumn = '1 / -1';
            emptyMsg.innerHTML = '<p class="review-item-text" style="margin-bottom:0;">No reviews yet. Be the first to share your experience!</p>';
            container.appendChild(emptyMsg);
        } else {
            toShow.forEach(review => {
                container.appendChild(createReviewCard(review));
            });
        }

        displayedCount = toShow.length;
        if (countSpan) countSpan.textContent = displayedCount;

        // Toggle Load More / Show Less buttons
        if (loadMoreBtn) {
            loadMoreBtn.style.display = sorted.length > REVIEWS_PER_PAGE && displayedCount < sorted.length ? 'inline-block' : 'none';
            loadMoreBtn.textContent = '\u3082\u3063\u3068\u898B\u308B';
            loadMoreBtn.disabled = false;
        }
        if (showLessBtn) {
            showLessBtn.style.display = displayedCount > REVIEWS_PER_PAGE ? 'inline-block' : 'none';
        }
    }

    // ── Fetch Reviews from API ──
    async function fetchReviews() {
        if (hasFetched) {
            // Already fetched — just re-render (for when SPA navigates back)
            renderReviews(false);
            updateSummaryCard(allReviews);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            allReviews = data.reviews || [];
            hasFetched = true;

            updateSummaryCard(allReviews);
            renderReviews(false);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            const container = document.getElementById('reviews-grid-container');
            const loadingEl = document.getElementById('reviews-loading');
            if (loadingEl) loadingEl.style.display = 'none';
            if (container) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'review-item-card';
                errorMsg.style.textAlign = 'center';
                errorMsg.style.gridColumn = '1 / -1';
                errorMsg.innerHTML = '<p class="review-item-text" style="margin-bottom:0;">Unable to load reviews. Please try again later.</p>';
                container.appendChild(errorMsg);
            }
            // Update summary to show empty state
            updateSummaryCard([]);
        }
    }

    // ── Submit Review ──
    async function submitReview(form) {
        const messageDiv = form.querySelector('#review-form-msg');
        const submitBtn = form.querySelector('.btn-submit-review');

        // Reset
        messageDiv.className = 'rev-form-message';
        messageDiv.textContent = '';

        // Validate rating
        const ratingInput = form.querySelector('input[name="rating"]:checked');
        if (!ratingInput) {
            messageDiv.textContent = 'Please select a star rating.';
            messageDiv.classList.add('error');
            return;
        }

        const nameVal = form.querySelector('#reviewerName').value;
        const commentVal = form.querySelector('#reviewText').value;

        // Validate text fields
        if (!nameVal.trim() || !commentVal.trim()) {
            messageDiv.textContent = 'Please fill out all required fields.';
            messageDiv.classList.add('error');
            const inputs = form.querySelectorAll('input[type="text"], textarea');
            inputs.forEach(input => {
                if (!input.value.trim()) input.classList.add('error');
            });
            return;
        }

        // Suspicious content guard
        if (isSuspicious(nameVal) || isSuspicious(commentVal)) {
            messageDiv.textContent = 'Your input contains disallowed content. Please remove any code or special characters.';
            messageDiv.classList.add('error');
            return;
        }

        // Sanitize before sending
        const cleanName = sanitizeInput(nameVal);
        const cleanComment = sanitizeInput(commentVal);
        const rating = parseInt(ratingInput.value, 10);

        // Max length (frontend guard — backend also enforces)
        if (cleanName.length > 100) {
            messageDiv.textContent = 'Display name must be 100 characters or less.';
            messageDiv.classList.add('error');
            return;
        }
        if (cleanComment.length > 1000) {
            messageDiv.textContent = 'Review must be 1000 characters or less.';
            messageDiv.classList.add('error');
            return;
        }

        // Disable button
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: cleanName,
                    rating: rating,
                    comment: cleanComment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Rate limit or validation error
                messageDiv.textContent = data.error || 'Something went wrong. Please try again.';
                messageDiv.classList.add('error');
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                return;
            }

            // Success
            form.reset();
            messageDiv.textContent = data.message || 'Thank you! Your review has been submitted and is pending approval.';
            messageDiv.classList.add('success');

            // Show remaining submissions info
            if (typeof data.remaining === 'number') {
                messageDiv.textContent += ` (${data.remaining} submission${data.remaining !== 1 ? 's' : ''} remaining today)`;
            }

            // Auto-hide success message after 8 seconds
            setTimeout(() => {
                messageDiv.className = 'rev-form-message';
                messageDiv.textContent = '';
            }, 8000);

        } catch (err) {
            console.error('Review submit error:', err);
            messageDiv.textContent = 'Network error. Please check your connection and try again.';
            messageDiv.classList.add('error');
        } finally {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        }
    }

    // ── Event Delegation (works with SPA router) ──

    // Form submission
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.id === 'reviewSubmitForm') {
            e.preventDefault();
            submitReview(e.target);
        }
    });

    // Remove error class on input
    document.addEventListener('input', function (e) {
        if (e.target && e.target.closest('#reviewSubmitForm')) {
            if (e.target.value.trim()) {
                e.target.classList.remove('error');
            }
        }
    });

    // Block paste of suspicious content
    document.addEventListener('paste', function (e) {
        if (e.target && e.target.closest('#reviewSubmitForm')) {
            // Let the paste happen, then check
            setTimeout(() => {
                if (isSuspicious(e.target.value)) {
                    e.target.value = sanitizeInput(e.target.value);
                    const messageDiv = document.getElementById('review-form-msg');
                    if (messageDiv) {
                        messageDiv.textContent = 'Suspicious content was removed from your input.';
                        messageDiv.className = 'rev-form-message error';
                        setTimeout(() => {
                            messageDiv.className = 'rev-form-message';
                            messageDiv.textContent = '';
                        }, 4000);
                    }
                }
            }, 0);
        }
    });

    // Load More
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'btnLoadMoreReviews') {
            renderReviews(true);
        }
    });

    // Show Less
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'btnShowLessReviews') {
            renderReviews(false);
            // Scroll to the reviews grid
            const grid = document.getElementById('reviews-grid-container');
            if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Sort change
    document.addEventListener('change', function (e) {
        if (e.target && e.target.id === 'reviewSort') {
            currentSort = e.target.value;
            const container = document.getElementById('reviews-grid-container');
            const cards = container ? container.querySelectorAll('.review-item-card') : [];

            // Fade out, re-render, fade in
            cards.forEach(card => card.style.opacity = '0');

            setTimeout(() => {
                renderReviews(displayedCount > REVIEWS_PER_PAGE);
            }, 300);
        }
    });

    // ── Auto-init: Watch for when the reviews page is loaded by the SPA router ──
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && (node.id === 'page-reviews' || node.querySelector?.('#reviews-content'))) {
                    fetchReviews();
                    return;
                }
            }
        }
    });

    const appContent = document.getElementById('app-content');
    if (appContent) {
        observer.observe(appContent, { childList: true });
    }

    // Also try immediate init in case the page is already loaded
    if (document.getElementById('reviews-content')) {
        fetchReviews();
    }
})();
