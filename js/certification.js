(function () {
    'use strict';

    var certModal   = document.getElementById('certModal');
    var modalImage  = document.getElementById('modalImage');
    var currentCredential = '';

    window.openModal = function (btn) {
        var card = btn.closest('.cert-card');
        if (!card || !certModal) return;

        currentCredential = card.getAttribute('data-credential');
        if (modalImage) {
            modalImage.src = card.getAttribute('data-img');
            modalImage.alt = card.getAttribute('data-title');
        }
        certModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function () {
        if (!certModal) return;
        certModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    window.copyCredential = function () {
        if (!currentCredential) return;
        navigator.clipboard.writeText(currentCredential)
            .then(function () {
                alert('Credential link copied: ' + currentCredential);
            })
            .catch(function () {
                alert('Failed to copy. You can manually copy the link.');
            });
    };

    window.addEventListener('click', function (e) {
        if (e.target === certModal) window.closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && certModal && certModal.style.display === 'flex') {
            window.closeModal();
        }
    });
})();