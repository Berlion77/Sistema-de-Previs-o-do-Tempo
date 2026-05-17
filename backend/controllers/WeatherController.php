<?php
// ============================================================
// A Juba que Prevê — Controller: Weather
// ============================================================

require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/WeatherModel.php';

class WeatherController {

    // ---- Buscar clima atual ----
    public static function current(): void {
        $payload = requireAuth();
        $city    = trim($_GET['city'] ?? '');
        $lang    = $_GET['lang'] ?? 'pt';

        if (!$city) jsonResponse(['error' => 'Cidade obrigatória'], 422);

        $cacheKey = "current:{$city}:{$lang}";
        $cached   = WeatherModel::getCache($cacheKey);
        if ($cached) {
            jsonResponse(['data' => $cached, 'from_cache' => true]);
        }

        $url  = BASE_URL . "/weather?q=" . urlencode($city) . "&appid=" . API_KEY . "&units=metric&lang={$lang}";
        $data = self::fetchApi($url);

        WeatherModel::setCache($cacheKey, $data);
        WeatherModel::addHistory($payload['sub'], $data['name'], $data['sys']['country'] ?? '');

        jsonResponse(['data' => $data, 'from_cache' => false]);
    }

    // ---- Previsão de 5 dias ----
    public static function forecast(): void {
        requireAuth();
        $city = trim($_GET['city'] ?? '');
        $lang = $_GET['lang'] ?? 'pt';

        if (!$city) jsonResponse(['error' => 'Cidade obrigatória'], 422);

        $cacheKey = "forecast:{$city}:{$lang}";
        $cached   = WeatherModel::getCache($cacheKey);
        if ($cached) jsonResponse(['data' => $cached, 'from_cache' => true]);

        $url  = BASE_URL . "/forecast?q=" . urlencode($city) . "&appid=" . API_KEY . "&units=metric&lang={$lang}&cnt=40";
        $data = self::fetchApi($url);

        WeatherModel::setCache($cacheKey, $data);
        jsonResponse(['data' => $data, 'from_cache' => false]);
    }

    // ---- Buscar por coordenadas (geolocalização) ----
    public static function byCoords(): void {
        requireAuth();
        $lat  = (float)($_GET['lat'] ?? 0);
        $lon  = (float)($_GET['lon'] ?? 0);
        $lang = $_GET['lang'] ?? 'pt';

        if (!$lat || !$lon) jsonResponse(['error' => 'Coordenadas inválidas'], 422);

        $cacheKey = "coords:{$lat}:{$lon}:{$lang}";
        $cached   = WeatherModel::getCache($cacheKey);
        if ($cached) jsonResponse(['data' => $cached, 'from_cache' => true]);

        $url  = BASE_URL . "/weather?lat={$lat}&lon={$lon}&appid=" . API_KEY . "&units=metric&lang={$lang}";
        $data = self::fetchApi($url);

        WeatherModel::setCache($cacheKey, $data);
        jsonResponse(['data' => $data, 'from_cache' => false]);
    }

    // ---- Favoritos ----
    public static function getFavorites(): void {
        $payload = requireAuth();
        jsonResponse(['favorites' => WeatherModel::getFavorites($payload['sub'])]);
    }

    public static function addFavorite(): void {
        $payload = requireAuth();
        $body    = getRequestBody();
        WeatherModel::addFavorite(
            $payload['sub'],
            $body['city']    ?? '',
            $body['country'] ?? '',
            (float)($body['lat'] ?? 0),
            (float)($body['lon'] ?? 0)
        );
        jsonResponse(['message' => 'Cidade adicionada aos favoritos']);
    }

    public static function removeFavorite(): void {
        $payload = requireAuth();
        $id      = (int)($_GET['id'] ?? 0);
        WeatherModel::removeFavorite($payload['sub'], $id);
        jsonResponse(['message' => 'Favorito removido']);
    }

    // ---- Histórico ----
    public static function getHistory(): void {
        $payload = requireAuth();
        jsonResponse(['history' => WeatherModel::getHistory($payload['sub'])]);
    }

    // ---- Alertas ----
    public static function getAlerts(): void {
        $payload = requireAuth();
        jsonResponse(['alerts' => WeatherModel::getAlerts($payload['sub'])]);
    }

    public static function addAlert(): void {
        $payload = requireAuth();
        $body    = getRequestBody();
        $id = WeatherModel::addAlert(
            $payload['sub'],
            $body['city']      ?? '',
            $body['country']   ?? '',
            $body['condition'] ?? '',
            isset($body['threshold']) ? (float)$body['threshold'] : null
        );
        jsonResponse(['message' => 'Alerta criado', 'id' => $id], 201);
    }

    public static function deleteAlert(): void {
        $payload = requireAuth();
        $id      = (int)($_GET['id'] ?? 0);
        WeatherModel::deleteAlert($payload['sub'], $id);
        jsonResponse(['message' => 'Alerta removido']);
    }

    // ---- Export CSV ----
    public static function exportHistoryCSV(): void {
        $payload = requireAuth();
        $history = WeatherModel::getHistory($payload['sub'], 1000);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="historico_pesquisas.csv"');

        $out = fopen('php://output', 'w');
        fputcsv($out, ['Cidade', 'País', 'Data']);
        foreach ($history as $row) {
            fputcsv($out, [$row['city_name'], $row['country'], $row['searched_at']]);
        }
        fclose($out);
        exit;
    }

    // ---- Admin: listar todos utilizadores ----
    public static function adminUsers(): void {
        requireAdmin();
        require_once __DIR__ . '/../models/UserModel.php';
        jsonResponse(['users' => UserModel::listAll()]);
    }

    // ---- Helper: HTTP fetch ----
    private static function fetchApi(string $url): array {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $response = curl_exec($ch);
        $code     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200) {
            $err = json_decode($response, true);
            jsonResponse(['error' => $err['message'] ?? 'Erro na API'], $code);
        }
        return json_decode($response, true);
    }
}
