<?php
/**
 * Same-origin PHP proxy voor de Wintrip Gids & Rondleidingsassistent op philip-wintrip.com.
 * Stuurt chatvragen server-to-server door naar de VPS (https://philip-wintrip.nl/agent/public/api/chat),
 * zodat de MiniMax API-sleutel uitsluitend op de VPS blijft en browsers nooit last hebben van CORS/adblockers.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Gebruik HTTP POST.']);
    exit;
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Leeg verzoek.']);
    exit;
}

$vpsEndpoint = 'https://philip-wintrip.nl/agent/public/api/chat';

if (function_exists('curl_init')) {
    $ch = curl_init($vpsEndpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $rawBody,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 22,
        CURLOPT_CONNECTTIMEOUT => 6,
    ]);
    $resp = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (is_string($resp) && $status >= 200 && $status < 300) {
        echo $resp;
        exit;
    }
}

$opts = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
        'content' => $rawBody,
        'ignore_errors' => true,
        'timeout' => 22,
    ],
];
$ctx = stream_context_create($opts);
$resp = @file_get_contents($vpsEndpoint, false, $ctx);
if (is_string($resp) && $resp !== '') {
    echo $resp;
    exit;
}

http_response_code(502);
echo json_encode(['ok' => false, 'error' => 'Assistent tijdelijk niet bereikbaar.']);
