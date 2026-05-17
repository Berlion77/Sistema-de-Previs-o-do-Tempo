-- ============================================================
-- A Juba que Prevê — Database Schema
-- Sistema de Previsão do Tempo — ISPTEC 2025/2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS ajuba_previsao
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ajuba_previsao;

-- ------------------------------------------------------------
-- Tabela 1: Utilizadores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(180)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('admin','user') NOT NULL DEFAULT 'user',
  language        VARCHAR(10)   NOT NULL DEFAULT 'pt',
  theme           ENUM('light','dark') NOT NULL DEFAULT 'light',
  reset_token     VARCHAR(255)  NULL,
  reset_expires   DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela 2: Cidades Favoritas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorite_cities (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  city_name   VARCHAR(120) NOT NULL,
  country     VARCHAR(10)  NOT NULL,
  lat         DECIMAL(10,6) NULL,
  lon         DECIMAL(10,6) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_city (user_id, city_name, country)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela 3: Histórico de Pesquisas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  city_name   VARCHAR(120) NOT NULL,
  country     VARCHAR(10)  NOT NULL,
  searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela 4: Cache de Clima (reduz chamadas à API)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_cache (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  city_key     VARCHAR(200) NOT NULL UNIQUE,
  data_json    LONGTEXT NOT NULL,
  cached_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela 5: Alertas de Clima
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_alerts (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  city_name   VARCHAR(120) NOT NULL,
  country     VARCHAR(10)  NOT NULL,
  condition   VARCHAR(50)  NOT NULL COMMENT 'rain,snow,storm,temp_above,temp_below',
  threshold   DECIMAL(6,2) NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed: Admin padrão (senha: admin123)
-- ------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, language, theme)
VALUES (
  'Administrador',
  'admin@ajuba.ao',
  '$2y$12$Q3K5vJb2OdYUMzSmXjYuCeHE0CfKD5TJmZpU3TfH1lLkC4fBsAW7a',
  'admin',
  'pt',
  'dark'
);
