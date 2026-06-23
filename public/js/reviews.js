// public/js/reviews.js
// TEMPORARY ONLY
document.addEventListener('DOMContentLoaded', () => {
    // We can run initialization here, but because of the router, 
    // it's better to use event delegation or init function.
    // The router doesn't explicitly call an initReviews function, 
    // so we'll use event delegation for clicks and submits.
});

// === Review Form Logic ===
document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'reviewSubmitForm') {
        e.preventDefault();

        const form = e.target;
        let isValid = true;

        // Remove previous errors
        const inputs = form.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => input.classList.remove('error'));

        const messageDiv = form.querySelector('#review-form-msg');
        messageDiv.className = 'rev-form-message'; // Reset

        // Validate Rating
        const ratingSelected = form.querySelector('input[name="rating"]:checked');
        if (!ratingSelected) {
            isValid = false;
            messageDiv.textContent = 'Please select a star rating.';
            messageDiv.classList.add('error');
            return;
        }

        // Validate text fields
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            }
        });

        if (!isValid) {
            messageDiv.textContent = 'Please fill out all required fields.';
            messageDiv.classList.add('error');
            return;
        }

        // Simulate submission
        const submitBtn = form.querySelector('.btn-submit-review');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            form.reset();

            messageDiv.textContent = 'Thank you! Your review has been submitted and is pending moderation.';
            messageDiv.classList.add('success');

            setTimeout(() => {
                messageDiv.className = 'rev-form-message';
            }, 5000);

        }, 1200);
    }
});

// Remove error class on input for review form
document.addEventListener('input', function (e) {
    if (e.target && e.target.closest('#reviewSubmitForm')) {
        if (e.target.value.trim()) {
            e.target.classList.remove('error');
        }
    }
});

// === Load More & Sorting Logic ===

// Dummy data for additional reviews
const moreReviews = [
    {
        stars: 5,
        text: "The Kare-Kare here is unbelievable. It's the best fusion dish I've had in a long time. Highly recommend to everyone visiting!",
        name: "Maria Santos",
        date: "6/18/2026"
    },
    {
        stars: 4,
        text: "Great atmosphere and friendly staff. The drinks were perfectly mixed, although the wait time was a bit long.",
        name: "Kenji Nakamura",
        date: "6/15/2026"
    },
    {
        stars: 5,
        text: "A truly luxurious experience. Everything from the interior to the plating of the sushi is top-notch.",
        name: "Sarah Lee",
        date: "6/10/2026"
    }
];

let reviewsLoaded = 0;

document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'btnLoadMoreReviews') {
        const btn = e.target;
        const container = document.getElementById('reviews-grid-container');
        const countSpan = document.getElementById('displayed-reviews-count');

        btn.textContent = "Loading...";
        btn.disabled = true;

        // Simulate network request
        setTimeout(() => {
            moreReviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-item-card extra-review';

                // Generate stars HTML
                let starsHtml = '';
                for (let i = 0; i < 5; i++) {
                    if (i < review.stars) {
                        starsHtml += '<span class="star filled">★</span>';
                    } else {
                        starsHtml += '<span class="star">★</span>';
                    }
                }

                card.innerHTML = `
                    <div class="review-item-stars">
                        ${starsHtml}
                    </div>
                    <p class="review-item-text">
                        "${review.text}"
                    </p>
                    <div class="review-item-author">
                        <div class="author-avatar-placeholder"></div>
                        <div class="author-details">
                            <span class="author-name">${review.name}</span>
                            <span class="author-date">${review.date}</span>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });

            // Update count
            let currentCount = parseInt(countSpan.textContent);
            countSpan.textContent = currentCount + moreReviews.length;

            // Hide button after loading once for demo purposes
            btn.style.display = 'none';
            const btnLess = document.getElementById('btnShowLessReviews');
            if (btnLess) btnLess.style.display = 'inline-block';

        }, 800);
    }
});

document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'btnShowLessReviews') {
        const btn = e.target;
        const container = document.getElementById('reviews-grid-container');
        const countSpan = document.getElementById('displayed-reviews-count');

        // Find and remove all elements with class 'extra-review'
        const extraReviews = container.querySelectorAll('.extra-review');
        extraReviews.forEach(card => card.remove());

        // Update count back
        let currentCount = parseInt(countSpan.textContent);
        countSpan.textContent = currentCount - moreReviews.length;

        // Hide 'Show Less' and Show 'Load More'
        btn.style.display = 'none';
        const loadMoreBtn = document.getElementById('btnLoadMoreReviews');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.textContent = 'もっと見る';
            loadMoreBtn.disabled = false;
        }
    }
});

// Sort logic visualization (simple animation feedback, since we don't have a real backend)
document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'reviewSort') {
        const container = document.getElementById('reviews-grid-container');
        const cards = Array.from(container.querySelectorAll('.review-item-card'));

        // Fade out
        cards.forEach(card => card.style.opacity = '0');

        setTimeout(() => {
            // Depending on value, sort the DOM elements
            const sortValue = e.target.value;

            cards.sort((a, b) => {
                const getStars = (el) => el.querySelectorAll('.star.filled').length;

                if (sortValue === 'highest') {
                    return getStars(b) - getStars(a);
                } else if (sortValue === 'lowest') {
                    return getStars(a) - getStars(b);
                } else {
                    // Newest - just shuffle or keep original for demo
                    return 0; // Assume original order is newest
                }
            });

            // Re-append in new order
            cards.forEach(card => {
                container.appendChild(card);
                // Trigger reflow
                void card.offsetWidth;
                card.style.opacity = '1';
                card.style.animation = 'none';
                card.style.animation = 'fadeUp 0.5s ease forwards';
            });

        }, 300);
    }
});
