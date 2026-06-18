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
    if (testimonialsScroll) {
        const cards = Array.from(testimonialsScroll.children);

        const gap = 20; 
        let originalSetWidth = 0;
        cards.forEach(card => {
            originalSetWidth += card.offsetWidth + gap;
        });

        // Clone the cards multiple times
        for (let i = 0; i < 4; i++) {
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                testimonialsScroll.appendChild(clone);
            });
        }

        let scrollSpeed = 1;
        let isHovered = false;
        let animationId;

        const scroll = () => {
            if (!isHovered) {
                testimonialsScroll.scrollLeft += scrollSpeed;

                // Reset seamlessly when we've scrolled exactly one original set's width
                if (testimonialsScroll.scrollLeft >= originalSetWidth) {
                    testimonialsScroll.scrollLeft -= originalSetWidth;
                }
            }
            animationId = requestAnimationFrame(scroll);
        };

        testimonialsScroll.addEventListener('mouseenter', () => { isHovered = true; });
        testimonialsScroll.addEventListener('mouseleave', () => { isHovered = false; });
        testimonialsScroll.addEventListener('touchstart', () => { isHovered = true; });
        testimonialsScroll.addEventListener('touchend', () => {
            setTimeout(() => { isHovered = false; }, 1000);
        });

        scroll();
    }
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
