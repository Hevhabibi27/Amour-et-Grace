// public/js/router.js

// ── SEO: Per-page meta data ──
const pageMeta = {
    home: {
        title: 'Amour et GRÀCE | LOUNGE • RESTO • BAR',
        description: 'A premium Filipino-Japanese lounge in Komaki City, Aichi. Experience fine dining, handcrafted cocktails, live DJ nights, and unforgettable events at Amour et Gràce.'
    },
    menu: {
        title: 'Our Menu | Amour et GRÀCE',
        description: 'Discover our curated menu of authentic Filipino and Japanese cuisine — sushi, ramen, wagyu, signature cocktails, and party platters in Komaki City, Aichi.'
    },
    events: {
        title: 'Events | Amour et GRÀCE',
        description: 'Join us for seasonal events, cocktail parties, karaoke nights, live DJ sets, and live music at Amour et Gràce lounge in Komaki City, Aichi, Japan.'
    },
    reservations: {
        title: 'Reservations | Amour et GRÀCE',
        description: 'Reserve your table or book a private event at Amour et Gràce lounge. Online reservations available for groups, private parties, and special celebrations.'
    },
    reviews: {
        title: 'Customer Reviews | Amour et GRÀCE',
        description: 'Read genuine customer reviews and share your own dining experience at Amour et Gràce — a top-rated Filipino-Japanese lounge in Komaki City, Aichi.'
    }
};

const updateMeta = (page) => {
    const meta = pageMeta[page] || pageMeta.home;
    // Update title
    document.title = meta.title;
    // Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.description);
};

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
            updateMeta(page);

            // Re-initialize scroll animations for cached page
            if (typeof Utils !== 'undefined') {
                if (Utils.initScrollReveals) Utils.initScrollReveals();
                if (Utils.initCinematicScroll) Utils.initCinematicScroll();
                if (Utils.initHorizontalTimeline) Utils.initHorizontalTimeline();
                if (Utils.initScrollEngine) Utils.initScrollEngine();
            }

            // Apply translations to cached page
            if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
                i18n.applyTranslations();
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

                // Strip any Live Server injected script (local dev only) so it
                // doesn't corrupt SVG elements or break bottom-of-page content.
                const cleanHtml = html.replace(
                    /<!--\s*Code injected by live-server\s*-->[\s\S]*?<\/script>/gi,
                    ''
                );

                // Guard: if user navigated away during fetch, abort
                if (!isLoading) return;

                const wrapper = document.createElement('div');
                wrapper.id = `page-${page}`;
                wrapper.innerHTML = cleanHtml;

                hideLoader();
                pageCache[page] = wrapper;
                appContent.appendChild(wrapper);
                currentPage = page;
                refreshNavbar();
                updateMeta(page);

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

                // Apply translations to freshly loaded page
                if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
                    i18n.applyTranslations();
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
