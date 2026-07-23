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
    // Komaki City, Aichi, Japan (JST / UTC+9)
    //
    // NEW SCHEDULE:
    //   Resto Bar:   Sunday 11:00 AM – 12 Midnight
    //   Lounge:      Wed & Thu 8:00 PM – 12 MN
    //                Fri & Sat 7:00 PM – 2:00 AM
    //   Closed:      Monday & Tuesday
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
        const updateStatus = () => {
            // Get current time in JST (UTC+9)
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const jstTime = new Date(utc + (3600000 * 9));

            const hours = jstTime.getHours();
            const day = jstTime.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

            let isOpen = false;
            let key = '';
            let defaultText = '';

            // ── Resto Bar: Sunday (day 0) 11:00–24:00 ──
            const isRestoOpen = day === 0 && hours >= 11;

            // ── Lounge logic ──
            // Wed (3) & Thu (4): 20:00–24:00
            const isLoungeWedThu = (day === 3 || day === 4) && hours >= 20;

            // Fri (5) & Sat (6): 19:00–02:00 (next day)
            const isLoungeFriSat = (day === 5 || day === 6) && hours >= 19;

            // Spillover: Sat 00:00–01:59 (from Friday night) or Sun 00:00–01:59 (from Saturday night)
            const isSatSpillover = day === 6 && hours < 2;  // Saturday early AM from Friday night
            const isSunSpillover = day === 0 && hours < 2;  // Sunday early AM from Saturday night

            const isLoungeOpen = isLoungeWedThu || isLoungeFriSat || isSatSpillover || isSunSpillover;

            if (isRestoOpen && isLoungeOpen) {
                // Unlikely overlap but handle it
                isOpen = true;
                key = 'nav.status.open.resto';
                defaultText = 'Open Now — Resto Bar';
            } else if (isRestoOpen) {
                isOpen = true;
                key = 'nav.status.open.resto';
                defaultText = 'Open Now — Closes 12 MN';
            } else if (isLoungeOpen) {
                isOpen = true;
                key = 'nav.status.open.lounge';
                if (isSatSpillover || isSunSpillover) {
                    defaultText = 'Open Now — Closes 2:00 AM';
                } else if (day === 5 || day === 6) {
                    defaultText = 'Open Now — Closes 2:00 AM';
                } else {
                    defaultText = 'Open Now — Closes 12 MN';
                }
            } else {
                // Closed — figure out what opens next
                if (day === 0) {
                    // Sunday
                    if (hours >= 2 && hours < 11) {
                        key = 'nav.status.closed.11am';
                        defaultText = 'Closed — Resto Bar Opens 11:00 AM';
                    } else {
                        // After midnight Sunday (= Monday)
                        key = 'nav.status.closed.wed';
                        defaultText = 'Closed — Opens Wednesday 8:00 PM';
                    }
                } else if (day === 1 || day === 2) {
                    // Monday or Tuesday — fully closed
                    key = 'nav.status.closed.wed';
                    defaultText = 'Closed — Opens Wednesday 8:00 PM';
                } else if (day === 3) {
                    // Wednesday before 20:00
                    key = 'nav.status.closed.8pm';
                    defaultText = 'Closed — Lounge Opens 8:00 PM';
                } else if (day === 4) {
                    // Thursday before 20:00
                    key = 'nav.status.closed.8pm';
                    defaultText = 'Closed — Lounge Opens 8:00 PM';
                } else if (day === 5) {
                    // Friday before 19:00
                    key = 'nav.status.closed.7pm';
                    defaultText = 'Closed — Lounge Opens 7:00 PM';
                } else if (day === 6) {
                    // Saturday 2:00–19:00
                    key = 'nav.status.closed.7pm';
                    defaultText = 'Closed — Lounge Opens 7:00 PM';
                }
            }

            const dot = statusBadge.querySelector('.status-dot');
            const text = statusBadge.querySelector('.status-text');

            if (isOpen) {
                statusBadge.classList.add('open');
                statusBadge.classList.remove('closed');
            } else {
                statusBadge.classList.add('closed');
                statusBadge.classList.remove('open');
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
