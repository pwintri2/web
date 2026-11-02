<?php
/**
 * Ontvangt de website-aanvraag van index.html en mailt de gegevens naar info@wintrip.nl.
 *
 * Werkt op twee manieren:
 *  - Met JavaScript (fetch): antwoord komt als JSON terug.
 *  - Zonder JavaScript (normale form-post): gebruiker wordt teruggestuurd naar index.html?verzonden=1
 *
 * Instellingen: pas ONTVANGST (en eventueel AFZENDER) aan wanneer de website op een
 * ander domein draait. AFZENDER moet dan een mailbox op datzelfde domein zijn,
 * anders wordt de mail door SPF/DMARC van de ontvanger weggegooid.
 */

declare(strict_types=1);

const ONTVANGST = 'info@wintrip.nl';
const AFZENDER  = 'website@wintrip.nl';
const TERUG_URL = 'aanvraag.html';

/* ------------------------------------------------------------------ helpers */

function veld(array $data, string $sleutel): string
{
    $waarde = $data[$sleutel] ?? '';
    if (is_array($waarde)) {
        $waarde = implode(', ', $waarde);
    }
    return trim((string) $waarde);
}

/** Geeft true terug als de aanvraag via fetch (JSON) is verstuurd. */
function isJsonVerzoek(): bool
{
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    return stripos($accept, 'json') !== false
        || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch';
}

function jsonAntwoord(bool $ok, string $bericht, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $ok, 'fout' => $ok ? '' : $bericht], JSON_UNESCAPED_UNICODE);
    exit;
}

function redirectTerug(bool $ok): void
{
    $url = TERUG_URL . ($ok ? '?verzonden=1' : '?fout=1') . '#aanvraag';
    header('Location: ' . $url);
    exit;
}

function onderwerpMail(string $naam, string $type): string
{
    $onderwerp = 'Website-aanvraag via wintrip.nl — ' . $naam;
    if ($type !== '') {
        $onderwerp .= ' — ' . $type;
    }
    // UTF-8 onderwerp correct coderen voor e-mailkoppen
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($onderwerp, 'UTF-8');
    }
    return '=?UTF-8?B?' . base64_encode($onderwerp) . '?=';
}

/* ------------------------------------------------------------------ verzoek */

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    if (isJsonVerzoek()) {
        jsonAntwoord(false, 'Alleen POST-verzoeken worden geaccepteerd.', 405);
    }
    redirectTerug(false);
}

$jsonVerzoek = isJsonVerzoek();

/* Honeypot: echte bezoekers vullen dit niet in. */
if (veld($_POST, 'bedrijfswebsite_hp') !== '') {
    if ($jsonVerzoek) {
        jsonAntwoord(true, 'Ontvangen.');
    }
    redirectTerug(true);
}

/* ------------------------------------------------------------- validatie */

$naam     = veld($_POST, 'naam');
$email    = veld($_POST, 'email');
$type     = veld($_POST, 'type_website');
$werk     = veld($_POST, 'werkomschrijving');
$privacy  = veld($_POST, 'privacy');

$ontbrekend = [];
if ($naam === '') {
    $ontbrekend[] = 'naam';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $ontbrekend[] = 'e-mailadres';
}
if ($werk === '') {
    $ontbrekend[] = 'omschrijving van je werk';
}
if ($privacy === '') {
    $ontbrekend[] = 'akkoord met de privacyverwerking';
}

if ($ontbrekend !== []) {
    $melding = 'Er ontbreken gegevens: ' . implode(', ', $ontbrekend) . '.';
    if ($jsonVerzoek) {
        jsonAntwoord(false, $melding, 422);
    }
    redirectTerug(false);
}

/* ------------------------------------------------------------ opbouwen mail */

$telefoon        = veld($_POST, 'telefoon');
$organisatie     = veld($_POST, 'organisatie');
$huidigeSite     = veld($_POST, 'huidige_website');
$uiterlijk       = veld($_POST, 'uiterlijk');
$kleuren         = veld($_POST, 'kleuren');
$pakket          = veld($_POST, 'pakket');
$onderhoud       = veld($_POST, 'onderhoud');
$startdatum      = veld($_POST, 'startdatum');
$bericht         = veld($_POST, 'bericht');
$functionaliteit = veld($_POST, 'functionaliteiten');

$regels = [];
$regels[] = 'NIEUWE WEBSITE-AANVRAAG';
$regels[] = 'Ontvangen: ' . date('d-m-Y H:i');
$regels[] = '';
$regels[] = 'CONTACT';
$regels[] = 'Naam: ' . ($naam ?: '-');
$regels[] = 'E-mail: ' . $email;
$regels[] = 'Telefoon: ' . ($telefoon ?: '-');
$regels[] = 'Praktijk / organisatie: ' . ($organisatie ?: '-');
$regels[] = 'Huidige website: ' . ($huidigeSite ?: '-');
$regels[] = '';
$regels[] = 'PROJECT';
$regels[] = 'Type website: ' . ($type ?: '-');
$regels[] = 'Gewenst uiterlijk: ' . ($uiterlijk ?: '-');
$regels[] = 'Kleur: ' . ($kleuren ?: '-');
$regels[] = 'Pakket: ' . ($pakket ?: '-');
$regels[] = 'Onderhoudsabonnement: ' . ($onderhoud ?: '-');
$regels[] = 'Gewenste startdatum: ' . ($startdatum ?: '-');
$regels[] = 'Gewenste functionaliteiten: ' . ($functionaliteit ?: '-');
$regels[] = '';
$regels[] = 'OVER JOUW WERK';
$regels[] = ($werk ?: '-');
$regels[] = '';

if ($bericht !== '') {
    $regels[] = 'BERICHT';
    $regels[] = $bericht;
    $regels[] = '';
}

$regels[] = '--';
$regels[] = 'Verzonden via de website van Philip Wintrip.';

$body = implode("\n", $regels);

/* --------------------------------------------------------------- verzenden */

$koppen = [
    'From: "Website-aanvraag" <' . AFZENDER . '>',
    'Reply-To: "' . str_replace(['"', "\r", "\n"], '', $naam) . '" <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$verzonden = @mail(ONTVANGST, onderwerpMail($naam, $type), $body, implode("\r\n", $koppen));

if (!$verzonden) {
    error_log('Website-aanvraag kon niet worden verzonden naar ' . ONTVANGST);
    if ($jsonVerzoek) {
        jsonAntwoord(false, 'De mail kon niet worden verstuurd. Probeer het later opnieuw of mail rechtstreeks naar info@wintrip.nl.', 500);
    }
    redirectTerug(false);
}

if ($jsonVerzoek) {
    jsonAntwoord(true, 'Je aanvraag is verzonden.');
}
redirectTerug(true);
