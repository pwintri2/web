(function () {
    'use strict';
'use strict';

            var ONTVANGST = 'info@wintrip.nl';

            /* Keuze uit de pakkettenpagina meenemen (?pakket=helder / ?onderhoud=zorgplus) */
            var urlParams = new URLSearchParams(window.location.search);
            ['pakket', 'onderhoud'].forEach(function (naam) {
                var waarde = urlParams.get(naam);
                if (!waarde) return;
                var radio = document.getElementById(naam + '-' + waarde);
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            var form = document.getElementById('aanvraag-formulier');
            var foutBox = document.getElementById('formulier-fout');
            var succesBox = document.getElementById('verzonden-melding');

            /* ---------------- Indicatie (live prijsberekening) ---------------- */
            var euro = function (bedrag) {
                return '€ ' + Number(bedrag).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            };

            function gekozen(naam) {
                var el = form.querySelector('input[name="' + naam + '"]:checked');
                return el ? el : null;
            }

            function updateIndicatie() {
                var pakket = gekozen('pakket');
                var onderhoud = gekozen('onderhoud');

                var pLabel = document.getElementById('indicatie-pakket');
                var pEenmalig = document.getElementById('indicatie-eenmalig');
                var oLabel = document.getElementById('indicatie-onderhoud');
                var oPerMaand = document.getElementById('indicatie-per-maand');
                var totaal = document.getElementById('indicatie-totaal');

                var eenmalig = pakket ? Number(pakket.dataset.prijs) : 0;
                var perMaand = onderhoud ? Number(onderhoud.dataset.prijs) : 0;

                pLabel.textContent = pakket ? pakket.value.split(' — ')[0] : '—';
                pEenmalig.textContent = pakket ? euro(eenmalig) : '—';
                oLabel.textContent = onderhoud ? onderhoud.value.split(' — ')[0] : '—';
                oPerMaand.textContent = onderhoud ? euro(perMaand) + ' /mnd' : '—';
                totaal.textContent = (pakket || onderhoud) ? euro(eenmalig + perMaand * 12) : '—';
            }

            if (form) {
                form.addEventListener('change', function (e) {
                    if (e.target.name === 'pakket' || e.target.name === 'onderhoud') {
                        updateIndicatie();
                    }
                });
                updateIndicatie();
            }

            /* ---------------- Knoppen in de pakket- & onderhoudskaarten ------- */
            function kiesEnScroll(id) {
                var radio = document.getElementById(id);
                if (!radio) return;
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                var doel = document.getElementById('aanvraag');
                if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            document.querySelectorAll('[data-kies-pakket]').forEach(function (knop) {
                knop.addEventListener('click', function () {
                    kiesEnScroll('pakket-' + knop.dataset.kiesPakket);
                });
            });

            document.querySelectorAll('[data-kies-onderhoud]').forEach(function (knop) {
                knop.addEventListener('click', function () {
                    kiesEnScroll('onderhoud-' + knop.dataset.kiesOnderhoud);
                });
            });

            /* ---------------- Foutmelding ------------------------------------- */
            function verbergFout() {
                if (!foutBox) return;
                foutBox.classList.add('hidden');
            }

            /* Toont de fout én een klikbare mailto-link als terugvaloptie. */
            function toonVerzendfout(bericht) {
                if (!foutBox) return;
                foutBox.textContent = bericht;
                var link = document.getElementById('mailto-verzenden');
                if (!link) {
                    link = document.createElement('a');
                    link.id = 'mailto-verzenden';
                    link.className = 'underline font-semibold ml-1 whitespace-nowrap';
                    link.href = 'mailto:' + ONTVANGST;
                    link.textContent = 'Open je e-mailprogramma';
                    foutBox.appendChild(link);
                }
                foutBox.classList.remove('hidden');
                foutBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            /* ---------------- Tekst van de aanvraag samenstellen -------------- */
            function veldWaarde(naam) {
                var el = form.querySelector('[name="' + naam + '"]');
                return el && el.value ? el.value.trim() : '';
            }

            function MailBody() {
                var regels = [];
                var push = function (kop, waarde) {
                    regels.push(kop + ': ' + (waarde || '-'));
                };

                regels.push('NIEUWE WEBSITE-AANVRAAG');
                regels.push('Ontvangen: ' + new Date().toLocaleString('nl-NL'));
                regels.push('');

                regels.push('CONTACT');
                push('Naam', veldWaarde('naam'));
                push('E-mail', veldWaarde('email'));
                push('Telefoon', veldWaarde('telefoon'));
                push('Praktijk / organisatie', veldWaarde('organisatie'));
                push('Huidige website', veldWaarde('huidige_website'));
                regels.push('');

                regels.push('PROJECT');
                push('Type website', veldWaarde('type_website'));
                push('Gewenst uiterlijk', veldWaarde('uiterlijk'));
                push('Kleur', veldWaarde('kleuren'));
                push('Pakket', veldWaarde('pakket'));
                push('Onderhoud', veldWaarde('onderhoud'));
                push('Gewenste startdatum', veldWaarde('startdatum'));

                var functies = Array.prototype.slice
                    .call(form.querySelectorAll('input[name="functionaliteiten[]"]:checked'))
                    .map(function (el) { return el.value; });
                push('Gewenste functionaliteiten', functies.join(', '));
                regels.push('');

                regels.push('OVER JOUW WERK');
                regels.push(veldWaarde('werkomschrijving') || '-');
                regels.push('');

                var bericht = veldWaarde('bericht');
                if (bericht) {
                    regels.push('BERICHT');
                    regels.push(bericht);
                    regels.push('');
                }

                regels.push('--');
                regels.push('Verzonden via de website van Philip Wintrip.');
                return regels.join('\n');
            }

            function mailtoFallback() {
                var onderwerp = 'Website-aanvraag — ' + (veldWaarde('naam') || 'nieuwe aanvraag');
                var body = MailBody();
                window.location.href = 'mailto:' + ONTVANGST +
                    '?subject=' + encodeURIComponent(onderwerp) +
                    '&body=' + encodeURIComponent(body);
            }

            /* ---------------- Versturen ---------------------------------------- */
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    verbergFout();

                    if (!form.reportValidity()) return;

                    var knop = form.querySelector('button[type="submit"]');
                    var origineel = knop.innerHTML;
                    knop.disabled = true;
                    knop.innerHTML = '<span>Versturen…</span>';

                    var data = new FormData(form);

                    fetch(form.action, {
                        method: 'POST',
                        body: data,
                        headers: { 'Accept': 'application/json' },
                        credentials: 'same-origin'
                    })
                        .then(function (respons) {
                            return respons.json().then(function (json) {
                                return { ok: respons.ok, json: json };
                            }).catch(function () {
                                return { ok: false, json: { fout: 'Onleesbaar antwoord van de server.' } };
                            });
                        })
                        .then(function (result) {
                            if (result.ok && result.json.ok) {
                                form.reset();
                                updateIndicatie();
                                if (succesBox) {
                                    succesBox.classList.remove('hidden');
                                    succesBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            } else {
                                var fout = (result.json && result.json.fout) ? result.json.fout : 'Verzenden mislukt.';
                                toonVerzendfout(fout + ' Je kunt je aanvraag ook direct mailen naar ' + ONTVANGST + ': ');
                            }
                        })
                        .catch(function () {
                            toonVerzendfout('We konden de server niet bereiken. Je kunt je aanvraag ook direct mailen naar ' + ONTVANGST + ': ');
                        })
                        .then(function () {
                            knop.disabled = false;
                            knop.innerHTML = origineel;
                        });
                });
            }

            /* ---------------- Melding na verzenden (zonder JavaScript) -------- */
            if (urlParams.get('verzonden') === '1' && succesBox) {
                succesBox.classList.remove('hidden');
                succesBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
})();
