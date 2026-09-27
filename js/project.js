(function () {
    'use strict';

    var filterBtns        = document.querySelectorAll('.filter-btn-horizontal');
    var filterSelect      = document.getElementById('filterSelect');
    var emptyStateMessage = document.getElementById('emptyStateMessage');
    var projectsGrid      = document.getElementById('projectsGrid');

    function filterProjects(category) {
        filterBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });
        if (filterSelect) filterSelect.value = category;

        var allProjects = document.querySelectorAll('.project-card');
        var anyVisible  = false;

        allProjects.forEach(function (p) {
            var c = p.getAttribute('data-category');
            if (category === 'all' || c === category) {
                p.classList.remove('hidden');
                anyVisible = true;
            } else {
                p.classList.add('hidden');
            }
        });

        if (!anyVisible && category !== 'all') {
            if (emptyStateMessage) emptyStateMessage.style.display = 'block';
            if (projectsGrid)      projectsGrid.style.display = 'none';
        } else {
            if (emptyStateMessage) emptyStateMessage.style.display = 'none';
            if (projectsGrid)      projectsGrid.style.display = 'grid';
        }
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterProjects(btn.getAttribute('data-filter'));
        });
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', function (e) {
            filterProjects(e.target.value);
        });
    }
})();