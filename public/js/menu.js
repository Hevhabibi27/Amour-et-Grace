// public/js/menu.js

var MAX_VISIBLE = 8;

function getCategory(btn) {
    var text = btn.textContent.trim().toLowerCase();
    return text === 'all' ? 'all' : text.replace(/\s+/g, '-');
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

    allCards.forEach(function (card) {
        var matches = category === 'all' || card.getAttribute('data-category') === category;

        if (!matches) {
            card.style.display = 'none';
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

    // ── Load More / Show Less Click ──
    if (target.classList.contains('btn-load-more')) {
        var section = target.closest('.container');
        if (!section) return;

        var grid = section.querySelector('.menu-showcase-grid');
        if (!grid) return;

        // Toggle expanded state
        grid.dataset.expanded = grid.dataset.expanded === 'true' ? 'false' : 'true';
        updateGrid(section);
    }
});
