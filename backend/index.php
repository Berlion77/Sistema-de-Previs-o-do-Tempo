<?php
// ============================================================
// A Juba que Prevê — Router principal
// ============================================================

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/WeatherController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$uri = strtok($uri, '?');
$uri = str_replace('/a-juba-que-preve/backend/index.php', '', $uri);
$uri = str_replace('/backend/index.php', '', $uri);
$uri = preg_replace('#^/a-juba-que-preve/backend#', '', $uri);
$uri = preg_replace('#^/backend#', '', $uri);
$uri = trim($uri, '/');
$uri = '/' . ($uri ?: '');

// Rotas de Autenticação
if ($method === 'POST' && $uri === '/auth/login') {
    AuthController::login();
}
elseif ($method === 'POST' && $uri === '/auth/register') {
    AuthController::register();
}
elseif ($method === 'GET' && $uri === '/auth/me') {
    AuthController::me();
}
elseif ($method === 'POST' && $uri === '/auth/forgot-password') {
    AuthController::forgotPassword();
}
elseif ($method === 'POST' && $uri === '/auth/reset-password') {
    AuthController::resetPassword();
}
elseif ($method === 'PUT' && $uri === '/auth/preferences') {
    AuthController::updatePreferences();
}

// Rotas de Clima
elseif ($method === 'GET' && $uri === '/weather/current') {
    WeatherController::current();
}
elseif ($method === 'GET' && $uri === '/weather/forecast') {
    WeatherController::forecast();
}
elseif ($method === 'GET' && $uri === '/weather/coords') {
    WeatherController::byCoords();
}

// Favoritos
elseif ($method === 'GET' && $uri === '/favorites') {
    WeatherController::getFavorites();
}
elseif ($method === 'POST' && $uri === '/favorites') {
    WeatherController::addFavorite();
}
elseif ($method === 'DELETE' && $uri === '/favorites') {
    WeatherController::removeFavorite();
}

// Histórico
elseif ($method === 'GET' && $uri === '/history') {
    WeatherController::getHistory();
}
elseif ($method === 'GET' && $uri === '/history/export') {
    WeatherController::exportHistoryCSV();
}

// Alertas
elseif ($method === 'GET' && $uri === '/alerts') {
    WeatherController::getAlerts();
}
elseif ($method === 'POST' && $uri === '/alerts') {
    WeatherController::addAlert();
}
elseif ($method === 'DELETE' && $uri === '/alerts') {
    WeatherController::deleteAlert();
}

// Admin
elseif ($method === 'GET' && $uri === '/admin/users') {
    WeatherController::adminUsers();
}

// Rota não encontrada
else {
    jsonResponse(['error' => 'Rota não encontrada', 'method' => $method, 'uri' => $uri, 'original' => $_SERVER['REQUEST_URI']], 404);
}
