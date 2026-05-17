<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = ['step' => [], 'error' => null];

try {
    $response['step'][] = 'Iniciando debug...';
    
    // 1. Testar conexão com banco
    $response['step'][] = 'Testando conexão com banco...';
    
    $host = 'localhost';
    $dbname = 'ajuba_previsao';
    $user = 'root';
    $pass = 'root@123';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $response['step'][] = '✅ Banco conectado!';
    
    // 2. Criar tabela se não existir
    $response['step'][] = 'Criando tabela users se não existir...';
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','user') NOT NULL DEFAULT 'user',
        language VARCHAR(10) NOT NULL DEFAULT 'pt',
        theme ENUM('light','dark') NOT NULL DEFAULT 'light',
        reset_token VARCHAR(255) NULL,
        reset_expires DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    $response['step'][] = '✅ Tabela users verificada/criada';
    
    // 3. Verificar se o admin existe
    $response['step'][] = 'Verificando admin...';
    $stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
    $stmt->execute(['admin@ajuba.ao']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $response['step'][] = '✅ Admin encontrado: ' . $user['name'];
        
        // Testar senha
        $testPass = 'admin123';
        if (password_verify($testPass, $user['password_hash'])) {
            $response['step'][] = '✅ Senha correta!';
            $response['success'] = true;
            $response['user'] = [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ];
        } else {
            $response['step'][] = '❌ Senha incorreta!';
            $response['success'] = false;
        }
    } else {
        $response['step'][] = '❌ Admin não encontrado!';
        $response['step'][] = 'Criando admin...';
        
        // Criar admin
        $hash = password_hash('admin123', PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')");
        
        if ($stmt->execute(['Administrador', 'admin@ajuba.ao', $hash])) {
            $response['step'][] = '✅ Admin criado com sucesso!';
            $response['step'][] = 'Email: admin@ajuba.ao';
            $response['step'][] = 'Senha: admin123';
            $response['admin_created'] = true;
            $response['success'] = true;
        } else {
            $response['step'][] = '❌ Erro ao criar admin';
            $response['success'] = false;
        }
    }
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    $response['success'] = false;
}

echo json_encode($response, JSON_PRETTY_PRINT);
