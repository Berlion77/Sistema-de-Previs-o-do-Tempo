<?php
// ============================================================
// A Juba que Prevê — Middleware (CORS + JWT Auth)
// ============================================================

require_once __DIR__ . '/../config/database.php';

// Polyfill para str_starts_with (PHP < 8)
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}

// ---- CORS ----
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Helpers ----
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ---- JWT (mini implementation) ----
function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwtEncode(array $payload): string {
    $header = base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = base64url(json_encode($payload));
    $sig = base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwtDecode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64_decode(strtr($body, '-_', '+/')), true);
    if (!$payload || (isset($payload['exp']) && $payload['exp'] < time())) return null;
    return $payload;
}

function requireAuth(): array {
    $headers = getallheaders();
    $auth = '';
    
    // Verificar em diferentes formatos de header
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (!str_starts_with($auth, 'Bearer ')) {
        jsonResponse(['error' => 'Não autenticado'], 401);
    }
    
    $payload = jwtDecode(substr($auth, 7));
    if (!$payload) {
        jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    }
    return $payload;
}

function requireAdmin(): array {
    $payload = requireAuth();
    if (($payload['role'] ?? '') !== 'admin') {
        jsonResponse(['error' => 'Acesso restrito'], 403);
    }
    return $payload;
}