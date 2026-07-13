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

    // ── Close menu when clicking a nav link ──
    document.querySelectorAll(".nav-links li a").forEach(link => {
        link.addEventListener("click", function () {
            // Close mobile menu
            if (hamburger) {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            }

            // Update active state
            document.querySelectorAll('.nav-links li a').forEach(l => {
                l.classList.remove('active');
            });
            this.classList.add('active');
        });
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

    // ── Live Status Badge ──
    // Nagoya City, Japan (JST / UTC+9)
    // Resto Bar: 9:00 AM – 5:00 PM  (Tuesday – Sunday)
    // Lounge:    8:00 PM – 2:00 AM  (Tuesday – Sunday)
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
        const updateStatus = () => {
            // Get current time in JST (UTC+9)
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const jstTime = new Date(utc + (3600000 * 9));

            const hours = jstTime.getHours();
            const day = jstTime.getDay(); // 0 = Sunday, 1 = Monday

            // Whole restaurant closed on Mondays
            const isMonday = day === 1;

            // Resto Bar: 9:00 – 17:00 every day except Monday
            const restoOpen = !isMonday && hours >= 9 && hours < 17;

            // Lounge: 20:00 – 02:00 every day EXCEPT Monday
            // If it's 20:00–23:59, the lounge is open (unless today is Monday)
            // If it's 00:00–01:59, the lounge is open (unless today is Monday,
            //   meaning it was Sunday night → still open. The closed night is
            //   Monday evening into Tuesday morning.)
            // Closed window: Monday 20:00 → Tuesday 01:59
            const isMondayEvening = day === 1 && hours >= 20;
            const isTuesdayEarlyMorning = day === 2 && hours < 2;
            const loungeHours = (hours >= 20) || (hours < 2);
            const loungeOpen = loungeHours && !isMondayEvening && !isTuesdayEarlyMorning;

            const dot = statusBadge.querySelector('.status-dot');
            const text = statusBadge.querySelector('.status-text');

            let key = '';
            let defaultText = '';

            if (restoOpen && loungeOpen) {
                // Both open (unlikely overlap but handle it)
                statusBadge.classList.add('open');
                statusBadge.classList.remove('closed');
                key = 'nav.status.open.lounge';
                defaultText = 'Open Now — Closes 2:00 AM';
            } else if (restoOpen) {
                statusBadge.classList.add('open');
                statusBadge.classList.remove('closed');
                key = 'nav.status.open.resto';
                defaultText = 'Open Now — Closes 5:00 PM';
            } else if (loungeOpen) {
                statusBadge.classList.add('open');
                statusBadge.classList.remove('closed');
                key = 'nav.status.open.lounge';
                defaultText = 'Open Now — Closes 2:00 AM';
            } else {
                statusBadge.classList.add('closed');
                statusBadge.classList.remove('open');
                // Figure out what opens next
                if (hours >= 2 && hours < 9) {
                    key = 'nav.status.closed.9am';
                    defaultText = 'Closed — Opens 9:00 AM';
                } else if (hours >= 17 && hours < 20) {
                    if (day === 1) {
                        // Monday evening, whole restaurant is closed
                        key = 'nav.status.closed.9am';
                        defaultText = 'Closed — Opens 9:00 AM';
                    } else {
                        key = 'nav.status.closed.8pm';
                        defaultText = 'Closed — Opens 8:00 PM';
                    }
                } else {
                    key = 'nav.status.closed.9am';
                    defaultText = 'Closed — Opens 9:00 AM';
                }
            }

            text.setAttribute('data-i18n', key);

            if (typeof i18n !== 'undefined' && i18n.translations[key]) {
                const lang = i18n.getLang();
                text.textContent = i18n.translations[key][lang] || defaultText;
            } else {
                text.textContent = defaultText;
            }
        };

        // Initialize and update every minute
        updateStatus();
        setInterval(updateStatus, 60000);
    }
});
