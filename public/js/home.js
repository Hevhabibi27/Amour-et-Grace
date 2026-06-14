// public/js/home.js

window.initHomeCarousel = function () {
    console.log('Home page loaded — initializing carousel.');

    const carousel = document.getElementById('menu-carousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.menu-card');
    if (cards.length === 0) return;

    const positions = ['card-left', 'card-center', 'card-right'];
    let currentCenter = 1; // Start with index 1 as center
    let intervalId = null;

    function updatePositions() {
        const total = cards.length;
        // Calculate left, center, right indices
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

    // Auto-play every 5 seconds
    function startAutoPlay() {
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Allow clicking side cards to rotate them to center
    carousel.addEventListener('click', function (e) {
        const clickedCard = e.target.closest('.menu-card');
        if (!clickedCard) return;

        // If clicking a side card, rotate so it becomes center
        if (clickedCard.classList.contains('card-left')) {
            currentCenter = (currentCenter - 1 + cards.length) % cards.length;
            updatePositions();
            stopAutoPlay();
            startAutoPlay(); // restart timer
        } else if (clickedCard.classList.contains('card-right')) {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        }
    });

    // Initialize
    updatePositions();
    startAutoPlay();
};

// Run on DOM load for initial page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '' || window.location.hash === '#home') {
        setTimeout(() => {
            if (typeof initHomeCarousel === 'function') initHomeCarousel();
        }, 100);
    }
});
