// public/js/utils.js
const Utils = {
    scrollToElement: (targetId) => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    },

    initScrollReveals: () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Trigger slightly before it comes into view
            threshold: 0.15 // Trigger when 15% of the element is visible
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(element => {
            revealObserver.observe(element);
        });
    },

    initCinematicScroll: () => {
        const cinematicSection = document.getElementById('cinematic-story');
        if (!cinematicSection) return;

        const items = cinematicSection.querySelectorAll('.cinematic-item');
        if (!items.length) return;

        // Calculate staggered trigger points for each item based on total items
        // E.g., if 10 items, triggers are at 0.1, 0.2, 0.3... scroll progress
        const step = 1 / (items.length + 1);

        const handleScroll = () => {
            const rect = cinematicSection.getBoundingClientRect();

            // Calculate progress (0 to 1) of scrolling through the section
            // Progress starts at 0 when the top of the section hits the top of the viewport
            // Progress ends at 1 when the bottom of the section hits the bottom of the viewport
            const scrollDistance = rect.height - window.innerHeight;
            let progress = -rect.top / scrollDistance;

            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Reveal items sequentially based on scroll progress
            items.forEach((item, index) => {
                const triggerPoint = step * (index + 1);
                if (progress >= triggerPoint) {
                    item.classList.add('scrolled-in');
                } else {
                    item.classList.remove('scrolled-in');
                }
            });
        };

        // Use requestAnimationFrame to optimize scroll listener
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true }); // passive flag improves scrolling performance

        // Initial check on load
        handleScroll();
    },

    initHorizontalTimeline: () => {
        const section = document.getElementById('upcoming-timeline');
        if (!section) return;

        const track = document.getElementById('timeline-track');
        const progressBar = document.getElementById('timeline-progress');
        const cards = track.querySelectorAll('.timeline-card');
        if (!cards.length) return;

        const handleScroll = () => {
            const rect = section.getBoundingClientRect();
            const scrollDistance = rect.height - window.innerHeight;

            // Progress from 0 to 1
            let progress = -rect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));

            // Max translation is total track width minus viewport width
            const maxTranslate = track.scrollWidth - window.innerWidth;
            const translateValue = -(progress * maxTranslate);

            // Apply highly optimized horizontal translation
            track.style.transform = `translateX(${translateValue}px)`;

            // Update connection line
            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }

            // Cinematic highlight: determine which card is focused in the center
            const viewportCenter = window.innerWidth / 2;
            let closestCard = null;
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + (cardRect.width / 2);
                const distance = Math.abs(viewportCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            // Make the center card active, dim the rest
            cards.forEach(card => {
                if (card === closestCard && minDistance < window.innerWidth * 0.4) {
                    card.classList.add('active-card');
                } else {
                    card.classList.remove('active-card');
                }
            });
        };

        // requestAnimationFrame for buttery smooth 60fps performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        handleScroll();
    }
};
