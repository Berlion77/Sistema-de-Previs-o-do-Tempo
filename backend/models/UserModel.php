<?php
// ============================================================
// A Juba que Prevê — Model: User
// ============================================================

require_once __DIR__ . '/../config/database.php';

class UserModel {

    public static function findByEmail(string $email): ?array {
        $db  = getDB();
        $st  = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        return $st->fetch() ?: null;
    }

    public static function findById(int $id): ?array {
        $db = getDB();
        $st = $db->prepare('SELECT id, name, email, role, language, theme, created_at FROM users WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    public static function create(string $name, string $email, string $password): int {
        $db   = getDB();
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>12]);
        $st   = $db->prepare('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)');
        $st->execute([$name, $email, $hash]);
        return (int) $db->lastInsertId();
    }

    public static function updatePreferences(int $userId, string $lang, string $theme): bool {
        $db = getDB();
        $st = $db->prepare('UPDATE users SET language=?, theme=? WHERE id=?');
        return $st->execute([$lang, $theme, $userId]);
    }

    public static function setResetToken(int $userId, string $token): bool {
        $db      = getDB();
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $st      = $db->prepare('UPDATE users SET reset_token=?, reset_expires=? WHERE id=?');
        return $st->execute([$token, $expires, $userId]);
    }

    public static function findByResetToken(string $token): ?array {
        $db = getDB();
        $st = $db->prepare('SELECT * FROM users WHERE reset_token=? AND reset_expires > NOW()');
        $st->execute([$token]);
        return $st->fetch() ?: null;
    }

    public static function updatePassword(int $userId, string $password): bool {
        $db   = getDB();
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>12]);
        $st   = $db->prepare('UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE id=?');
        return $st->execute([$hash, $userId]);
    }

    public static function listAll(): array {
        $db = getDB();
        return $db->query('SELECT id, name, email, role, language, theme, created_at FROM users ORDER BY created_at DESC')->fetchAll();
    }
}
