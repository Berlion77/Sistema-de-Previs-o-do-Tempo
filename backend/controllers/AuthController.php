<?php
// ============================================================
// A Juba que Prevê — Controller: Auth
// ============================================================

require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/UserModel.php';

class AuthController {

    public static function register(): void {
        $body = getRequestBody();
        $name  = trim($body['name']  ?? '');
        $email = trim($body['email'] ?? '');
        $pass  = $body['password']   ?? '';

        if (!$name || !$email || !$pass) {
            jsonResponse(['error' => 'Campos obrigatórios em falta'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'Email inválido'], 422);
        }
        if (strlen($pass) < 6) {
            jsonResponse(['error' => 'Senha deve ter pelo menos 6 caracteres'], 422);
        }
        if (UserModel::findByEmail($email)) {
            jsonResponse(['error' => 'Email já registado'], 409);
        }

        $id   = UserModel::create($name, $email, $pass);
        $user = UserModel::findById($id);
        $token = jwtEncode(['sub' => $id, 'role' => 'user', 'exp' => time() + 86400 * 7]);

        jsonResponse(['token' => $token, 'user' => $user], 201);
    }

    public static function login(): void {
        $body  = getRequestBody();
        $email = trim($body['email']    ?? '');
        $pass  = $body['password']      ?? '';

        $user = UserModel::findByEmail($email);
        if (!$user || !password_verify($pass, $user['password_hash'])) {
            jsonResponse(['error' => 'Credenciais inválidas'], 401);
        }

        $token = jwtEncode([
            'sub'  => $user['id'],
            'role' => $user['role'],
            'exp'  => time() + 86400 * 7
        ]);

        unset($user['password_hash'], $user['reset_token'], $user['reset_expires']);
        jsonResponse(['token' => $token, 'user' => $user]);
    }

    public static function me(): void {
        $payload = requireAuth();
        $user    = UserModel::findById($payload['sub']);
        if (!$user) jsonResponse(['error' => 'Utilizador não encontrado'], 404);
        jsonResponse(['user' => $user]);
    }

    public static function forgotPassword(): void {
        $body  = getRequestBody();
        $email = trim($body['email'] ?? '');
        $user  = UserModel::findByEmail($email);
        if (!$user) {
            // não revelar se o email existe
            jsonResponse(['message' => 'Se o email existir, receberá instruções']);
        }
        $token = bin2hex(random_bytes(32));
        UserModel::setResetToken($user['id'], $token);
        // Em produção: enviar email. Aqui retornamos o token para demo.
        jsonResponse(['message' => 'Token gerado', 'reset_token' => $token]);
    }

    public static function resetPassword(): void {
        $body  = getRequestBody();
        $token = $body['token']    ?? '';
        $pass  = $body['password'] ?? '';

        if (!$token || strlen($pass) < 6) {
            jsonResponse(['error' => 'Dados inválidos'], 422);
        }
        $user = UserModel::findByResetToken($token);
        if (!$user) {
            jsonResponse(['error' => 'Token inválido ou expirado'], 400);
        }
        UserModel::updatePassword($user['id'], $pass);
        jsonResponse(['message' => 'Senha atualizada com sucesso']);
    }

    public static function updatePreferences(): void {
        $payload = requireAuth();
        $body    = getRequestBody();
        $lang    = $body['language'] ?? 'pt';
        $theme   = $body['theme']    ?? 'light';
        UserModel::updatePreferences($payload['sub'], $lang, $theme);
        jsonResponse(['message' => 'Preferências guardadas']);
    }
}
