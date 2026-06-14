// public/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
    // Navigation links handler
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                e.preventDefault();
                return;
            }

            // If the link is meant to be a route (like #home, #menu), 
            // we should let the default behavior happen so the hash changes and router catches it.
            // But we still want to update the active class manually.
            document.querySelectorAll('.nav-links li a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Scroll effect for sticky navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Initial check in case page is already scrolled down
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        }

        window.addEventListener('scroll', () => {
            // Toggle the scrolled class when the user scrolls past the navbar's initial height
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});
