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
    const testimonialsScroll = document.querySelector('.testimonials-scroll');
    if (!testimonialsScroll) return;

    // Prevent double-init if called more than once
    if (testimonialsScroll.dataset.initialized) return;
    testimonialsScroll.dataset.initialized = 'true';

    const originalCards = Array.from(testimonialsScroll.children);

    // Clone cards for seamless infinite loop (clone once is enough)
    originalCards.forEach(card => {
        testimonialsScroll.appendChild(card.cloneNode(true));
    });

    // Use requestAnimationFrame with a translate transform so it works
    // even with overflow:hidden, and offsetWidth is read after a paint.
    requestAnimationFrame(() => {
        const cardWidth = originalCards[0] ? originalCards[0].offsetWidth : 300;
        const gap = 20;
        const totalWidth = originalCards.length * (cardWidth + gap);

        let offset = 0;
        let paused = false;
        let rafId;

        const speed = 0.5; // px per frame

        const animate = () => {
            if (!paused) {
                offset += speed;
                if (offset >= totalWidth) {
                    offset -= totalWidth;
                }
                testimonialsScroll.style.transform = `translateX(-${offset}px)`;
            }
            rafId = requestAnimationFrame(animate);
        };

        testimonialsScroll.addEventListener('mouseenter', () => { paused = true; });
        testimonialsScroll.addEventListener('mouseleave', () => { paused = false; });
        testimonialsScroll.addEventListener('touchstart', () => { paused = true; }, { passive: true });
        testimonialsScroll.addEventListener('touchend', () => {
            setTimeout(() => { paused = false; }, 1000);
        });

        rafId = requestAnimationFrame(animate);

        // Expose stop function for cleanup if needed
        window.stopTestimonialsCarousel = () => cancelAnimationFrame(rafId);
    });
};

// Run on DOM load for initial page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '' || window.location.hash === '#home') {
        setTimeout(() => {
            if (typeof initHomeCarousel === 'function') initHomeCarousel();
            if (typeof initTestimonialsCarousel === 'function') initTestimonialsCarousel();
        }, 100);
    }
});
