// public/js/router.js
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navbar = document.querySelector('.navbar');
    const pageCache = {};   // Stores live DOM wrappers by page name
    let currentPage = null;
    let isLoading = false;  // Race condition guard

    // ── Loading Indicator (created once, reused) ──
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
    `;

    const showLoader = () => {
        appContent.appendChild(loader);
    };

    const hideLoader = () => {
        if (loader.parentNode) loader.remove();
    };

    const refreshNavbar = () => {
        if (!navbar) return;
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    const loadPage = async (page) => {
        if (page === currentPage || isLoading) return;

        // ── 1. Scroll to top BEFORE any DOM change (prevents visual jump)
        window.scrollTo(0, 0);

        // ── 2. Detach current page (keep it alive in cache)
        if (currentPage && pageCache[currentPage]) {
            pageCache[currentPage].remove();

            // Pause home carousel when leaving the home page
            if (currentPage === 'home' && typeof window.pauseHomeCarousel === 'function') {
                window.pauseHomeCarousel();
            }
        }

        // ── 3. If already cached, re-attach and resume — no fetch needed
        if (pageCache[page]) {
            appContent.appendChild(pageCache[page]);
            currentPage = page;
            refreshNavbar();

            // Re-initialize scroll animations for cached page
            if (typeof Utils !== 'undefined') {
                if (Utils.initScrollReveals) Utils.initScrollReveals();
                if (Utils.initCinematicScroll) Utils.initCinematicScroll();
                if (Utils.initHorizontalTimeline) Utils.initHorizontalTimeline();
                if (Utils.initScrollEngine) Utils.initScrollEngine();
            }

            // Resume home carousel when returning
            if (page === 'home' && typeof window.resumeHomeCarousel === 'function') {
                window.resumeHomeCarousel();
            }
            return;
        }

        // ── 4. First visit — fetch, cache, and init
        isLoading = true;
        showLoader();

        try {
            // Prevent browser caching during local development for fetch requests
            const response = await fetch(`pages/${page}.html`, { cache: 'no-store' });
            if (response.ok) {
                const html = await response.text();

                // Guard: if user navigated away during fetch, abort
                if (!isLoading) return;

                const wrapper = document.createElement('div');
                wrapper.id = `page-${page}`;
                wrapper.innerHTML = html;

                hideLoader();
                pageCache[page] = wrapper;
                appContent.appendChild(wrapper);
                currentPage = page;
                refreshNavbar();

                // Initialize scroll animations
                if (typeof Utils !== 'undefined') {
                    if (Utils.initScrollReveals) Utils.initScrollReveals();
                    if (Utils.initCinematicScroll) Utils.initCinematicScroll();
                    if (Utils.initHorizontalTimeline) Utils.initHorizontalTimeline();
                    if (Utils.initScrollEngine) Utils.initScrollEngine();
                }

                // One-time init for page-specific scripts
                if (page === 'home') {
                    if (typeof initHomeCarousel === 'function') initHomeCarousel();
                    if (typeof initTestimonialsCarousel === 'function') initTestimonialsCarousel();
                    if (typeof initGalleryLightbox === 'function') initGalleryLightbox();
                }
            } else {
                hideLoader();
                appContent.innerHTML = '<h2>404 - Page not found</h2>';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            hideLoader();
            appContent.innerHTML = '<h2>Error loading content</h2>';
        } finally {
            isLoading = false;
        }
    };

    const handleRoute = () => {
        let hash = window.location.hash.substring(1);
        if (!hash) {
            hash = 'home';
        }

        // Update active class on nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('active');
            }
        });

        loadPage(hash);
    };

    window.addEventListener('hashchange', handleRoute);

    // Initial load
    handleRoute();
});
