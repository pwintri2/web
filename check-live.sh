#!/usr/bin/env bash
#
# Controleert of alle pagina's en bestanden van de website online staan.
# Gebruik:  ./check-live.sh [basis-url]   (standaard: https://philip-wintrip.com/web/)
#
set -u

BASIS="${1:-https://philip-wintrip.com/web/}"
BASIS="${BASIS%/}/"

pad=$'\033[30;1m'
groen=$'\033[32;1m'
rood=$'\033[31;1m'
reset=$'\033[0m'

printf '%s\n' "Controleren van ${BASIS}" ""
fouten=0

controleer() {
    local pad_="$1" verwacht="$2" label="$3"
    local code
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "${BASIS}${pad_}")
    if [ "$code" = "$verwacht" ]; then
        printf '  %s✓%s  %-28s %s\n' "$groen" "$reset" "$label" "$pad_"
    else
        printf '  %s✗%s  %-28s %s (verwacht %s)\n' "$rood" "$reset" "$label" "$pad_" "$verwacht"
        fouten=$((fouten + 1))
    fi
}

printf '%sPagina%s\n' "$pad" "$reset"
controleer "index.html" 200 "Home"
controleer "pakketten.html" 200 "Pakketten & prijzen"
controleer "aanvraag.html" 200 "Aanvraag"
controleer "faq.html" 200 "FAQ"

printf '\n%sBestanden%s\n' "$pad" "$reset"
controleer "verzenden.php" 302 "Mailhandler (PHP)"
controleer "assets/site.css" 200 "Gedeelde stijlen"
controleer "assets/site.js" 200 "Navigatie & menu"
controleer "assets/formulier.js" 200 "Formulierlogica"
controleer "assets/hero-bg.svg" 200 "Achtergrond"
controleer "assets/hero-banner.png" 200 "README-banner"

printf '\n'
if [ "$fouten" -eq 0 ]; then
    printf '%sAlles staat online.%s\n' "$groen" "$reset"
else
    printf '%s%d bestand(en) ontbreken — upload ze naar %s%s\n' "$rood" "$fouten" "$BASIS" "$reset"
    printf 'De pagina’s zijn statisch; controleer of de nieuwe bestanden daadwerkelijk zijn meegestuurd.\n'
fi

exit "$fouten"
