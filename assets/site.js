(function () {
    'use strict';

    /* Actieve pagina markeren in navigatie en footer */
    var bestand = window.location.pathname.split('/').pop();
    if (!bestand || bestand.indexOf('.') === -1) {
        bestand = 'index.html';
    }
    var sleutel = bestand.replace('.html', '');
    document.querySelectorAll('[data-nav]').forEach(function (link) {
        if (link.getAttribute('data-nav') === sleutel) {
            link.setAttribute('aria-current', 'page');
        }
    });

    /* Mobiel menu */
    var knop = document.getElementById('menu-knop');
    var menu = document.getElementById('mobiel-menu');
    var icoonOpen = document.getElementById('menu-icoon-open');
    var icoonSluit = document.getElementById('menu-icoon-sluit');

    function zetMenu(open) {
        if (!menu || !knop) return;
        menu.classList.toggle('hidden', !open);
        knop.setAttribute('aria-expanded', String(open));
        knop.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
        if (icoonOpen) icoonOpen.classList.toggle('hidden', open);
        if (icoonSluit) icoonSluit.classList.toggle('hidden', !open);
    }

    if (knop && menu) {
        knop.addEventListener('click', function () {
            zetMenu(menu.classList.contains('hidden'));
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { zetMenu(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') zetMenu(false);
        });
    }

    /* Jaartal in de footer */
    var jaar = document.getElementById('jaar');
    if (jaar) jaar.textContent = String(new Date().getFullYear());
})();
