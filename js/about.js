(function () {
    'use strict';

    /* ===== FILTER ===== */
    var filterBtns        = document.querySelectorAll('.filter-btn-horizontal');
    var filterSelect      = document.getElementById('filterSelect');
    var emptyStateMessage = document.getElementById('emptyStateMessage');

    function filterContent(category) {
        // Update active state on desktop buttons
        filterBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });

        // Sync dropdown
        if (filterSelect) filterSelect.value = category;

        // Show/hide cards
        var sections      = document.querySelectorAll('.section');
        var allCards      = document.querySelectorAll('.card');
        var hasVisible    = false;

        allCards.forEach(function (card) {
            var c = card.getAttribute('data-category');
            if (category === 'all' || c === category) {
                card.classList.remove('hidden');
                hasVisible = true;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show/hide whole sections
        sections.forEach(function (section) {
            var sc     = section.getAttribute('data-section');
            var cards  = section.querySelectorAll('.card');
            var hasCard = false;
            cards.forEach(function (c) {
                if (!c.classList.contains('hidden')) hasCard = true;
            });

            if (category === 'all') {
                section.classList.remove('hidden-section');
            } else if (sc === category && hasCard) {
                section.classList.remove('hidden-section');
            } else {
                section.classList.add('hidden-section');
            }
        });

        // Empty state
        if (emptyStateMessage) {
            emptyStateMessage.style.display =
                (!hasVisible && category !== 'all') ? 'block' : 'none';
        }
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterContent(btn.getAttribute('data-filter'));
        });
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', function (e) {
            filterContent(e.target.value);
        });
    }

    /* ===== MODALS ===== */
    var viewBtns  = document.querySelectorAll('.view-btn');
    var modals    = document.querySelectorAll('.modal');
    var closeBtns = document.querySelectorAll('.close-modal');

    viewBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var m = document.getElementById(btn.getAttribute('data-modal'));
            if (m) {
                m.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var m = btn.closest('.modal');
            if (m) {
                m.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });

    window.addEventListener('click', function (e) {
        modals.forEach(function (m) {
            if (e.target === m) {
                m.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
})();