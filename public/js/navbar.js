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
    // Resto Bar: 9:00 AM – 5:00 PM  (Monday – Sunday)
    // Lounge:    7:00 PM – 2:00 AM  (Every day except Tuesday)
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
        const updateStatus = () => {
            // Get current time in JST (UTC+9)
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const jstTime = new Date(utc + (3600000 * 9));

            const hours = jstTime.getHours();
            const day = jstTime.getDay(); // 0 = Sunday, 2 = Tuesday

            // Resto Bar: 9:00 – 17:00 every day
            const restoOpen = hours >= 9 && hours < 17;

            // Lounge: 19:00 – 02:00 every day EXCEPT Tuesday
            // If it's 19:00–23:59, the lounge is open (unless today is Tuesday)
            // If it's 00:00–01:59, the lounge is open (unless today is Tuesday,
            //   meaning it was Monday night → still open. The closed night is
            //   Tuesday evening into Wednesday morning.)
            // Closed window: Tuesday 19:00 → Wednesday 01:59
            const isTuesdayEvening = day === 2 && hours >= 19;
            const isWednesdayEarlyMorning = day === 3 && hours < 2;
            const loungeHours = (hours >= 19) || (hours < 2);
            const loungeOpen = loungeHours && !isTuesdayEvening && !isWednesdayEarlyMorning;

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
                } else if (hours >= 17 && hours < 19) {
                    if (day === 2) {
                        // Tuesday evening, lounge is closed
                        key = 'nav.status.closed.9am';
                        defaultText = 'Closed — Opens 9:00 AM';
                    } else {
                        key = 'nav.status.closed.7pm';
                        defaultText = 'Closed — Opens 7:00 PM';
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
