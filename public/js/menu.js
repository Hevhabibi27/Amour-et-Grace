// public/js/menu.js

var MAX_VISIBLE = 8;
var MAX_VISIBLE_PLATTERS = 6; // 2 rows × 3 columns

function getCategory(btn) {
    return btn.getAttribute('data-filter') || 'all';
}

function updateGrid(section) {
    var grid = section.querySelector('.menu-showcase-grid');
    var filterBar = section.querySelector('.menu-filter-bar');
    var loadMoreContainer = section.querySelector('.load-more-container');
    if (!grid) return;

    // Get active category
    var activeBtn = filterBar ? filterBar.querySelector('.filter-btn.active') : null;
    var category = activeBtn ? getCategory(activeBtn) : 'all';
    var isExpanded = grid.dataset.expanded === 'true';

    // Filter and paginate cards
    var allCards = grid.querySelectorAll('.showcase-card, .drinks-card');
    var matchCount = 0;
    var visibleIndex = 0;

    allCards.forEach(function (card) {
        var matches = category === 'all' || card.getAttribute('data-category') === category;

        if (!matches) {
            card.style.display = 'none';
            card.classList.remove('animate-in');
        } else {
            matchCount++;
            card.style.display = (isExpanded || matchCount <= MAX_VISIBLE) ? '' : 'none';
        }
    });

    // Update Load More / Show Less buttons
    if (loadMoreContainer) {
        var buttons = loadMoreContainer.querySelectorAll('.btn-load-more');
        var loadBtn = buttons[0];
        var lessBtn = buttons[1];

        if (matchCount <= MAX_VISIBLE) {
            // All cards visible — no buttons needed
            if (loadBtn) loadBtn.style.display = 'none';
            if (lessBtn) lessBtn.style.display = 'none';
        } else if (isExpanded) {
            if (loadBtn) loadBtn.style.display = 'none';
            if (lessBtn) lessBtn.style.display = 'inline-block';
        } else {
            if (loadBtn) {
                loadBtn.style.display = 'inline-block';
                loadBtn.disabled = false;
            }
            if (lessBtn) lessBtn.style.display = 'none';
        }
    }
}

// ── Platters Load More / Show Less ──
function updatePlatterGrid(wrapper) {
    var grid = wrapper.querySelector('.platters-grid');
    if (!grid) return;

    var loadMoreContainer = wrapper.querySelector('.platter-load-more-container');
    var isExpanded = grid.dataset.expanded === 'true';
    var allCards = grid.querySelectorAll('.platter-card');

    allCards.forEach(function (card, index) {
        card.style.display = (isExpanded || index < MAX_VISIBLE_PLATTERS) ? '' : 'none';
    });

    if (loadMoreContainer) {
        var buttons = loadMoreContainer.querySelectorAll('.btn-load-more');
        var loadBtn = buttons[0];
        var lessBtn = buttons[1];

        if (allCards.length <= MAX_VISIBLE_PLATTERS) {
            if (loadBtn) loadBtn.style.display = 'none';
            if (lessBtn) lessBtn.style.display = 'none';
        } else if (isExpanded) {
            if (loadBtn) loadBtn.style.display = 'none';
            if (lessBtn) lessBtn.style.display = 'inline-block';
        } else {
            if (loadBtn) {
                loadBtn.style.display = 'inline-block';
                loadBtn.disabled = false;
            }
            if (lessBtn) lessBtn.style.display = 'none';
        }
    }
}

document.addEventListener('click', function (e) {
    var target = e.target;

    // ── Filter Button Click ──
    if (target.classList.contains('filter-btn')) {
        var filterBar = target.closest('.menu-filter-bar');
        if (!filterBar) return;

        filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        target.classList.add('active');

        var section = filterBar.closest('.container');
        if (!section) return;

        var grid = section.querySelector('.menu-showcase-grid');
        if (grid) grid.dataset.expanded = 'false';

        updateGrid(section);
    }

    // ── Load More / Show Less Click (Showcase Grid) ──
    if (target.classList.contains('btn-load-more')) {
        // Check if this is a platter button
        var platterContainer = target.closest('.platter-load-more-container');
        if (platterContainer) {
            var wrapper = platterContainer.closest('.menu-showcase-container') || platterContainer.closest('.container');
            if (!wrapper) return;
            var grid = wrapper.querySelector('.platters-grid');
            if (!grid) return;
            grid.dataset.expanded = grid.dataset.expanded === 'true' ? 'false' : 'true';
            updatePlatterGrid(wrapper);
            return;
        }

        // Otherwise it's a showcase grid button
        var section = target.closest('.container');
        if (!section) return;

        var grid = section.querySelector('.menu-showcase-grid');
        if (!grid) return;

        // Toggle expanded state
        grid.dataset.expanded = grid.dataset.expanded === 'true' ? 'false' : 'true';
        updateGrid(section);
    }
});

// ── Initialize all grids (called by router after page load) ──
function initMenuGrids() {
    document.querySelectorAll('.menu-showcase-grid').forEach(function (grid) {
        var section = grid.closest('.container');
        if (section) updateGrid(section);
    });

    // Initialize platter grids
    document.querySelectorAll('.platters-grid').forEach(function (grid) {
        var wrapper = grid.closest('.menu-showcase-container') || grid.closest('.container');
        if (wrapper) updatePlatterGrid(wrapper);
    });
}
