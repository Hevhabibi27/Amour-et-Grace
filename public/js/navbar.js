// public/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navbar = document.querySelector('.navbar');

    // ── Hamburger toggle ──
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // ── Close mobile menu when clicking a nav link ──
    document.querySelectorAll(".nav-links li a").forEach(link => {
        link.addEventListener("click", function () {
            if (hamburger) {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            }
        });
    });

    // ── Active link highlighting based on current URL ──
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        // Match: index.html or "" or "/" for home, otherwise match filename
        if (
            (pageName === '' || pageName === '/' || pageName === 'index.html') && (href === 'index.html' || href === '/')
        ) {
            link.classList.add('active');
        } else if (href === pageName) {
            link.classList.add('active');
        }
    });

    // ── Scroll effect for sticky navbar ──
    if (navbar) {
        const updateNavbar = () => {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        updateNavbar();
        window.addEventListener('scroll', updateNavbar);
    }
});
