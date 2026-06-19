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

        const step = 1 / (items.length + 1);

        // Store handler on the section element so the unified listener can call it
        cinematicSection._scrollHandler = () => {
            const rect = cinematicSection.getBoundingClientRect();
            const scrollDistance = rect.height - window.innerHeight;
            let progress = -rect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));

            items.forEach((item, index) => {
                const triggerPoint = step * (index + 1);
                if (progress >= triggerPoint) {
                    item.classList.add('scrolled-in');
                } else {
                    item.classList.remove('scrolled-in');
                }
            });
        };

        cinematicSection._scrollHandler();
    },

    initHorizontalTimeline: () => {
        const section = document.getElementById('upcoming-timeline');
        if (!section) return;

        const track = document.getElementById('timeline-track');
        const progressBar = document.getElementById('timeline-progress');
        const cards = track.querySelectorAll('.timeline-card');
        if (!cards.length) return;

        // Cache card dimensions once (avoid per-frame layout thrashing)
        let cachedCardWidth = 0;
        let cachedGap = 0;
        let cachedMaxTranslate = 0;
        let lastActiveIndex = -1;

        const cacheLayout = () => {
            cachedCardWidth = cards[0].offsetWidth;
            const styles = getComputedStyle(track);
            cachedGap = parseFloat(styles.gap) || 100;
            cachedMaxTranslate = track.scrollWidth - window.innerWidth;
        };

        cacheLayout();
        window.addEventListener('resize', cacheLayout, { passive: true });

        section._scrollHandler = () => {
            const rect = section.getBoundingClientRect();
            const scrollDistance = rect.height - window.innerHeight;
            let progress = -rect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));

            const translateValue = -(progress * cachedMaxTranslate);
            track.style.transform = `translateX(${translateValue}px)`;

            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }

            // Calculate active card mathematically instead of calling getBoundingClientRect on every card
            const currentOffset = progress * cachedMaxTranslate;
            const cardStep = cachedCardWidth + cachedGap;
            const activeIndex = Math.round(currentOffset / cardStep);
            const clampedIndex = Math.max(0, Math.min(cards.length - 1, activeIndex));

            // Only update DOM if the active card actually changed
            if (clampedIndex !== lastActiveIndex) {
                cards.forEach((card, i) => {
                    if (i === clampedIndex) {
                        card.classList.add('active-card');
                    } else {
                        card.classList.remove('active-card');
                    }
                });
                lastActiveIndex = clampedIndex;
            }
        };

        section._scrollHandler();
    },

    // Single unified scroll listener for all scroll-driven sections
    initScrollEngine: () => {
        const cinematicSection = document.getElementById('cinematic-story');
        const timelineSection = document.getElementById('upcoming-timeline');

        // If neither section exists, don't attach any listener
        if (!cinematicSection && !timelineSection) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (cinematicSection && cinematicSection._scrollHandler) {
                        cinematicSection._scrollHandler();
                    }
                    if (timelineSection && timelineSection._scrollHandler) {
                        timelineSection._scrollHandler();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
};
