// public/js/home.js

window.initHomeCarousel = function () {
    console.log('Home page loaded — initializing carousel.');

    const carousel = document.getElementById('menu-carousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.menu-card');
    if (cards.length === 0) return;

    let currentCenter = 1;
    let intervalId = null;

    function updatePositions() {
        const total = cards.length;
        const leftIdx = (currentCenter - 1 + total) % total;
        const centerIdx = currentCenter;
        const rightIdx = (currentCenter + 1) % total;

        cards.forEach(card => {
            card.classList.remove('card-left', 'card-center', 'card-right');
        });

        cards[leftIdx].classList.add('card-left');
        cards[centerIdx].classList.add('card-center');
        cards[rightIdx].classList.add('card-right');
    }

    function nextSlide() {
        currentCenter = (currentCenter + 1) % cards.length;
        updatePositions();
    }

    function startAutoPlay() {
        if (intervalId) return; // already running
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function onMouseEnter() { stopAutoPlay(); }
    function onMouseLeave() { startAutoPlay(); }

    function onClick(e) {
        const clickedCard = e.target.closest('.menu-card');
        if (!clickedCard) return;

        if (clickedCard.classList.contains('card-left')) {
            currentCenter = (currentCenter - 1 + cards.length) % cards.length;
            updatePositions();
            stopAutoPlay();
            startAutoPlay();
        } else if (clickedCard.classList.contains('card-right')) {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        }
    }

    carousel.addEventListener('mouseenter', onMouseEnter);
    carousel.addEventListener('mouseleave', onMouseLeave);
    carousel.addEventListener('click', onClick);

    // Initialize
    updatePositions();
    startAutoPlay();

    // Expose pause / resume so the router can toggle without destroying
    window.pauseHomeCarousel = function () {
        stopAutoPlay();
    };

    window.resumeHomeCarousel = function () {
        startAutoPlay();
    };
};

window.initTestimonialsCarousel = function () {
    const wrapper = document.querySelector('.testimonials-wrapper');
    const scroll = document.querySelector('.testimonials-scroll');
    if (!scroll) return;

    // Cancel any previous animation before re-initialising (SPA navigation)
    if (window._testimonialsRafId) {
        cancelAnimationFrame(window._testimonialsRafId);
        window._testimonialsRafId = null;
    }

    // Reset state so re-init always works cleanly
    scroll.dataset.initialized = '';
    // Remove any previously injected clones
    scroll.querySelectorAll('.testimonial-clone').forEach(el => el.remove());
    scroll.style.transform = '';

    const originals = Array.from(scroll.children);
    if (originals.length === 0) return;

    // Clone the full set TWICE so the loop-back point is always off-screen
    [...originals, ...originals].forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('testimonial-clone');
        scroll.appendChild(clone);
    });

    // Read measurements after a paint so offsetWidth / gap are accurate
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const cardWidth = originals[0].offsetWidth;

            // Read the actual gap from computed style
            const computedGap = parseFloat(
                getComputedStyle(scroll).columnGap ||
                getComputedStyle(scroll).gap ||
                '20'
            ) || 20;

            // The loop point: one full set of original cards
            const loopWidth = originals.length * (cardWidth + computedGap);

            let offset = 0;
            let paused = false;
            const speed = 0.5; // px per frame (~30px/sec at 60fps)

            const tick = () => {
                if (!paused) {
                    offset += speed;
                    // Seamless reset: modulo keeps offset in [0, loopWidth)
                    // with zero fractional drift — no visible jump
                    if (offset >= loopWidth) {
                        offset -= loopWidth; // identical to modulo, avoids float drift
                    }
                    scroll.style.transform = `translateX(-${offset}px)`;
                }
                window._testimonialsRafId = requestAnimationFrame(tick);
            };

            // Pause on hover / touch so users can read cards
            scroll.addEventListener('mouseenter', () => { paused = true; });
            scroll.addEventListener('mouseleave', () => { paused = false; });
            scroll.addEventListener('touchstart', () => { paused = true; }, { passive: true });
            scroll.addEventListener('touchend', () => {
                setTimeout(() => { paused = false; }, 800);
            }, { passive: true });

            window._testimonialsRafId = requestAnimationFrame(tick);

            window.stopTestimonialsCarousel = () => {
                cancelAnimationFrame(window._testimonialsRafId);
                window._testimonialsRafId = null;
            };
        });
    });
};

// ── Gallery Lightbox ──
window.initGalleryLightbox = function () {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // Open lightbox on gallery image click
    document.querySelectorAll('.gallery-item .gallery-img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.addEventListener('click', closeLightbox);

    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't close when clicking the image itself
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
};

// Run on DOM load for initial page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '' || window.location.hash === '#home') {
        setTimeout(() => {
            if (typeof initHomeCarousel === 'function') initHomeCarousel();
            if (typeof initTestimonialsCarousel === 'function') initTestimonialsCarousel();
            if (typeof initGalleryLightbox === 'function') initGalleryLightbox();
        }, 100);
    }
});
