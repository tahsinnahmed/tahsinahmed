(function () {
    'use strict';

    var el = document.getElementById('current-year');
    if (el) {
        el.textContent = new Date().getFullYear();
    }
})();