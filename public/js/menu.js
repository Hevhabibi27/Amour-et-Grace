// public/js/menu.js

function handleLoadMoreToggle(btnIdLoad, btnIdLess, containerId, extraItemClass) {
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === btnIdLoad) {
            const btn = e.target;
            const container = document.getElementById(containerId);
            if (!container) return;

            btn.textContent = "Loading...";
            btn.disabled = true;

            // Simulate a slight loading delay for effect
            setTimeout(() => {
                const extraItems = container.querySelectorAll('.' + extraItemClass);
                extraItems.forEach(card => {
                    card.style.display = 'block';
                });

                // Hide Load More, Show Show Less
                btn.style.display = 'none';
                const btnLess = document.getElementById(btnIdLess);
                if (btnLess) btnLess.style.display = 'inline-block';

            }, 400); // short delay since we're just un-hiding
        }

        if (e.target && e.target.id === btnIdLess) {
            const btn = e.target;
            const container = document.getElementById(containerId);
            if (!container) return;

            // Hide all extra items
            const extraItems = container.querySelectorAll('.' + extraItemClass);
            extraItems.forEach(card => {
                card.style.display = 'none';
            });

            // Hide Show Less, Show Load More
            btn.style.display = 'none';
            const loadMoreBtn = document.getElementById(btnIdLoad);
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'inline-block';
                loadMoreBtn.textContent = 'Load More';
                loadMoreBtn.disabled = false;
            }
        }
    });
}

// Initialize for Menu Selection Section
handleLoadMoreToggle('btnLoadMoreMenu', 'btnShowLessMenu', 'menu-showcase-grid-container', 'extra-menu-item');

// Initialize for Japanese Food Section
handleLoadMoreToggle('btnLoadMoreJapanese', 'btnShowLessJapanese', 'menu-japanese-grid-container', 'extra-japanese-item');

// Initialize for Drinks Section
handleLoadMoreToggle('btnLoadMoreDrinks', 'btnShowLessDrinks', 'menu-drinks-grid-container', 'extra-drinks-item');

// ── Filter Bar Functionality ──
// Use event delegation so this works even when HTML is loaded dynamically.

document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('filter-btn')) {
        const btn = e.target;
        const filterBar = btn.closest('.menu-filter-bar');
        if (!filterBar) return;

        // Update active state for buttons in THIS filter bar only
        const buttons = filterBar.querySelectorAll('.filter-btn');
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Convert button text to a category slug
        var filterText = btn.textContent.trim().toLowerCase();
        var category = filterText === 'all' ? 'all' : filterText.replace(/\s+/g, '-');

        // Find the corresponding grid container in this section
        const container = filterBar.closest('.container');
        if (!container) return;

        const gridContainer = container.querySelector('.menu-showcase-grid');
        if (!gridContainer) return;

        // Get all cards inside this specific grid
        var cards = gridContainer.querySelectorAll('.showcase-card, .drinks-card');

        cards.forEach(function (card) {
            var cardCategory = card.getAttribute('data-category');

            // Check if this card is an extra item (initially hidden)
            var isExtra = card.classList.contains('extra-menu-item') ||
                card.classList.contains('extra-japanese-item') ||
                card.classList.contains('extra-drinks-item');

            if (category === 'all') {
                // Show all non-extra cards, keep extra cards hidden
                card.style.display = isExtra ? 'none' : '';
            } else {
                if (cardCategory === category) {
                    // Show matching cards (but keep extra ones hidden)
                    card.style.display = isExtra ? 'none' : '';
                } else {
                    // Hide non-matching cards
                    card.style.display = 'none';
                }
            }
        });
    }
});
