(function () {
    'use strict';

    var toggleBtn = document.getElementById('mobileToggleBtn');
    var drawer    = document.getElementById('mobileDrawer');
    var overlay   = document.getElementById('drawerOverlay');
    var closeBtn  = document.getElementById('closeDrawerBtn');

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
    if (overlay)   overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
    });

    document.querySelectorAll('.drawer-nav a').forEach(function (link) {
        link.addEventListener('click', closeDrawer);
    });
})();