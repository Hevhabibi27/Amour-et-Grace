// public/js/router.js
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');

    const loadPage = async (page) => {
        try {
            const response = await fetch(`pages/${page}.html`);
            if (response.ok) {
                const html = await response.text();
                appContent.innerHTML = html;
                
                // Re-initialize specific scripts if needed
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
            hash = 'home'; // default route
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
