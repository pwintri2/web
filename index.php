<?php
/**
 * Compatibiliteits-wrapper voor hosts die alleen .php-bestanden serveren.
 * De pagina zelf staat in index.html; dit bestand stuurt die door.
 */
declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
