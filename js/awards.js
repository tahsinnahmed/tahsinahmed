(function () {
    'use strict';

    /* ===== FILTER ===== */
    var filterBtns        = document.querySelectorAll('.filter-btn-horizontal');
    var filterSelect      = document.getElementById('filterSelect');
    var emptyStateMessage = document.getElementById('emptyStateMessage');

    function filterAwards(category) {
        filterBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });
        if (filterSelect) filterSelect.value = category;

        var allCards            = document.querySelectorAll('.award-card');
        var fellowshipSection   = document.querySelector('.section[data-section="fellowship"]');
        var competitionSection  = document.querySelector('.section[data-section="competition"]');

        var fellowshipHasVisible  = false;
        var competitionHasVisible = false;
        var anyVisible            = false;

        allCards.forEach(function (card) {
            var c = card.getAttribute('data-category');
            if (category === 'all') {
                card.classList.remove('hidden');
                if (c === 'fellowship')  fellowshipHasVisible  = true;
                if (c === 'competition') competitionHasVisible = true;
                anyVisible = true;
            } else if (c === category) {
                card.classList.remove('hidden');
                if (category === 'fellowship')  fellowshipHasVisible  = true;
                if (category === 'competition') competitionHasVisible = true;
                anyVisible = true;
            } else {
                card.classList.add('hidden');
            }
        });

        if (fellowshipSection) {
            if ((category === 'all' || category === 'fellowship') && fellowshipHasVisible) {
                fellowshipSection.classList.remove('hidden-section');
            } else {
                fellowshipSection.classList.add('hidden-section');
            }
        }

        if (competitionSection) {
            if ((category === 'all' || category === 'competition') && competitionHasVisible) {
                competitionSection.classList.remove('hidden-section');
            } else {
                competitionSection.classList.add('hidden-section');
            }
        }

        if (emptyStateMessage) {
            emptyStateMessage.style.display =
                (!anyVisible && category !== 'all') ? 'block' : 'none';
        }
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterAwards(btn.getAttribute('data-filter'));
        });
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', function (e) {
            filterAwards(e.target.value);
        });
    }

    /* ===== AWARD MODAL ===== */
    var awardModal = document.getElementById('awardModal');
    var modalImage = document.getElementById('modalImage');

    window.openModal = function (btn) {
        var card = btn.closest('.award-card');
        if (!card || !awardModal) return;
        if (modalImage) modalImage.src = card.getAttribute('data-img');
        awardModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function () {
        if (!awardModal) return;
        awardModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    window.addEventListener('click', function (e) {
        if (e.target === awardModal) window.closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && awardModal && awardModal.style.display === 'flex') {
            window.closeModal();
        }
    });
})();