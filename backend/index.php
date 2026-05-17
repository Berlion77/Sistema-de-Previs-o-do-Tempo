<?php
// ============================================================
// A Juba que Prevê — Router principal (backend/index.php)
// ============================================================

require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/WeatherController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Remove o prefixo do caminho da pasta backend (ajuste conforme o servidor)
$uri = preg_replace('#^/backend#', '', $uri);

// ============================================================
// Rotas de Autenticação
// ============================================================
if ($method === 'POST' && $uri === '/auth/register') {
    AuthController::register();
}
if ($method === 'POST' && $uri === '/auth/login') {
    AuthController::login();
}
if ($method === 'GET' && $uri === '/auth/me') {
    AuthController::me();
}
if ($method === 'POST' && $uri === '/auth/forgot-password') {
    AuthController::forgotPassword();
}
if ($method === 'POST' && $uri === '/auth/reset-password') {
    AuthController::resetPassword();
}
if ($method === 'PUT' && $uri === '/auth/preferences') {
    AuthController::updatePreferences();
}

// ============================================================
// Rotas de Clima
// ============================================================
if ($method === 'GET' && $uri === '/weather/current') {
    WeatherController::current();
}
if ($method === 'GET' && $uri === '/weather/forecast') {
    WeatherController::forecast();
}
if ($method === 'GET' && $uri === '/weather/coords') {
    WeatherController::byCoords();
}

// ============================================================
// Favoritos
// ============================================================
if ($method === 'GET' && $uri === '/favorites') {
    WeatherController::getFavorites();
}
if ($method === 'POST' && $uri === '/favorites') {
    WeatherController::addFavorite();
}
if ($method === 'DELETE' && $uri === '/favorites') {
    WeatherController::removeFavorite();
}

// ============================================================
// Histórico
// ============================================================
if ($method === 'GET' && $uri === '/history') {
    WeatherController::getHistory();
}
if ($method === 'GET' && $uri === '/history/export') {
    WeatherController::exportHistoryCSV();
}

// ============================================================
// Alertas
// ============================================================
if ($method === 'GET' && $uri === '/alerts') {
    WeatherController::getAlerts();
}
if ($method === 'POST' && $uri === '/alerts') {
    WeatherController::addAlert();
}
if ($method === 'DELETE' && $uri === '/alerts') {
    WeatherController::deleteAlert();
}

// ============================================================
// Admin
// ============================================================
if ($method === 'GET' && $uri === '/admin/users') {
    WeatherController::adminUsers();
}

// ---- Rota não encontrada ----
jsonResponse(['error' => 'Rota não encontrada'], 404);
