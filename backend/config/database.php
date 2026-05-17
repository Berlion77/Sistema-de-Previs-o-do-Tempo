<?php
// ============================================================
// A Juba que Prevê — Configuração da Base de Dados
// ============================================================

define('DB_HOST',     'localhost');
define('DB_NAME',     'ajuba_previsao');
define('DB_USER',     'root');
define('DB_PASS',     'root@123');
define('DB_CHARSET',  'utf8mb4');

define('API_KEY',  '14e4f95bc9b675678ec749c9220ebd87');
define('BASE_URL', 'https://api.openweathermap.org/data/2.5');
define('JWT_SECRET', 'ajuba_secret_2026_isptec');
define('CACHE_TTL', 1800); // 30 minutos

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}
