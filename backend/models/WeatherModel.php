<?php
// ============================================================
// A Juba que Prevê — Model: Weather / Favorites / History
// ============================================================

require_once __DIR__ . '/../config/database.php';

class WeatherModel {

    // ---- Cache ----
    public static function getCache(string $key): ?array {
        $db = getDB();
        $st = $db->prepare('SELECT data_json FROM weather_cache WHERE city_key=? AND expires_at > NOW()');
        $st->execute([$key]);
        $row = $st->fetch();
        return $row ? json_decode($row['data_json'], true) : null;
    }

    public static function setCache(string $key, array $data): void {
        $db      = getDB();
        $json    = json_encode($data, JSON_UNESCAPED_UNICODE);
        $expires = date('Y-m-d H:i:s', time() + CACHE_TTL);
        $st      = $db->prepare('INSERT INTO weather_cache (city_key, data_json, expires_at)
                                  VALUES (?,?,?)
                                  ON DUPLICATE KEY UPDATE data_json=VALUES(data_json), cached_at=NOW(), expires_at=VALUES(expires_at)');
        $st->execute([$key, $json, $expires]);
    }

    // ---- History ----
    public static function addHistory(int $userId, string $city, string $country): void {
        $db = getDB();
        $st = $db->prepare('INSERT INTO search_history (user_id, city_name, country) VALUES (?,?,?)');
        $st->execute([$userId, $city, $country]);
    }

    public static function getHistory(int $userId, int $limit = 20): array {
        $db = getDB();
        $st = $db->prepare('SELECT city_name, country, searched_at FROM search_history
                             WHERE user_id=? ORDER BY searched_at DESC LIMIT ?');
        $st->execute([$userId, $limit]);
        return $st->fetchAll();
    }

    // ---- Favorites ----
    public static function addFavorite(int $userId, string $city, string $country, float $lat, float $lon): bool {
        $db = getDB();
        $st = $db->prepare('INSERT IGNORE INTO favorite_cities (user_id, city_name, country, lat, lon) VALUES (?,?,?,?,?)');
        return $st->execute([$userId, $city, $country, $lat, $lon]);
    }

    public static function removeFavorite(int $userId, int $favId): bool {
        $db = getDB();
        $st = $db->prepare('DELETE FROM favorite_cities WHERE id=? AND user_id=?');
        return $st->execute([$favId, $userId]);
    }

    public static function getFavorites(int $userId): array {
        $db = getDB();
        $st = $db->prepare('SELECT * FROM favorite_cities WHERE user_id=? ORDER BY created_at DESC');
        $st->execute([$userId]);
        return $st->fetchAll();
    }

    // ---- Alerts ----
    public static function addAlert(int $userId, string $city, string $country, string $condition, ?float $threshold): int {
        $db = getDB();
        $st = $db->prepare('INSERT INTO weather_alerts (user_id, city_name, country, alert_condition, threshold) VALUES (?,?,?,?,?)');
        $st->execute([$userId, $city, $country, $condition, $threshold]);
        return (int) $db->lastInsertId();
    }

    public static function getAlerts(int $userId): array {
        $db = getDB();
        $st = $db->prepare('SELECT id, city_name, country, alert_condition AS condition, threshold, active, created_at FROM weather_alerts WHERE user_id=? ORDER BY created_at DESC');
        $st->execute([$userId]);
        return $st->fetchAll();
    }

    public static function deleteAlert(int $userId, int $alertId): bool {
        $db = getDB();
        $st = $db->prepare('DELETE FROM weather_alerts WHERE id=? AND user_id=?');
        return $st->execute([$alertId, $userId]);
    }
}
