// public/js/router.js
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navbar = document.querySelector('.navbar');
    const pageCache = {};   // Stores live DOM wrappers by page name
    let currentPage = null;

    const refreshNavbar = () => {
        if (!navbar) return;
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    const loadPage = async (page) => {
        if (page === currentPage) return;

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

            // Resume home carousel when returning
            if (page === 'home' && typeof window.resumeHomeCarousel === 'function') {
                window.resumeHomeCarousel();
            }
            return;
        }

        // ── 4. First visit — fetch, cache, and init
        try {
            const response = await fetch(`pages/${page}.html`);
            if (response.ok) {
                const html = await response.text();
                const wrapper = document.createElement('div');
                wrapper.id = `page-${page}`;
                wrapper.innerHTML = html;

                pageCache[page] = wrapper;
                appContent.appendChild(wrapper);
                currentPage = page;
                refreshNavbar();

                // One-time init for page-specific scripts
                if (page === 'home' && typeof initHomeCarousel === 'function') {
                    initHomeCarousel();
                }
            } else {
                appContent.innerHTML = '<h2>404 - Page not found</h2>';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            appContent.innerHTML = '<h2>Error loading content</h2>';
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
