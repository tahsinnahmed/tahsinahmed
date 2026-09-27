(function () {
    'use strict';

    var filterBtns        = document.querySelectorAll('.filter-btn');
    var filterSelect      = document.getElementById('filterSelect');
    var emptyStateMessage = document.getElementById('emptyStateMessage');

    function filterPublications(category) {
        filterBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });
        if (filterSelect) filterSelect.value = category;

        var sections        = document.querySelectorAll('.section-item');
        var hasVisibleContent = false;

        sections.forEach(function (section) {
            var sc = section.getAttribute('data-section');
            if (category === 'all' || sc === category) {
                section.classList.remove('hidden-section');
                hasVisibleContent = true;
            } else {
                section.classList.add('hidden-section');
            }
        });

        if (emptyStateMessage) {
            emptyStateMessage.style.display =
                (!hasVisibleContent && category !== 'all') ? 'block' : 'none';
        }
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterPublications(btn.getAttribute('data-filter'));
        });
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', function (e) {
            filterPublications(e.target.value);
        });
    }
})();