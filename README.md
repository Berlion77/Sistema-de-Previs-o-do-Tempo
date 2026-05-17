# 🦁 A Juba que Prevê
**Sistema de Previsão do Tempo — ISPTEC | Engenharia de Software II | 2025/2026**

---

## 📁 Estrutura do Projeto

```
a-juba-que-preve/
│
├── frontend/                        # Frontend (Angular-style modular)
│   ├── index.html                   # Ponto de entrada da aplicação
│   ├── i18n/
│   │   ├── pt.js                    # Traduções em Português
│   │   └── en.js                    # Traduções em Inglês
│   ├── services/
│   │   ├── api.js                   # Comunicação HTTP com o backend
│   │   └── auth.js                  # Gestão de sessão/autenticação
│   ├── components/
│   │   ├── weather-card.js          # Componente de card de clima
│   │   └── modal.js                 # Componente de modal reutilizável
│   └── assets/
│       ├── css/style.css            # Estilos principais (dark/light mode)
│       └── js/app.js                # Controlador e router principal
│
├── backend/                         # Backend PHP Puro
│   ├── index.php                    # Router principal (entry point)
│   ├── .htaccess                    # Rewrite rules para URLs limpas
│   ├── config/
│   │   └── database.php             # Configuração BD + constantes API
│   ├── middleware/
│   │   └── auth.php                 # CORS, JWT, helpers de resposta
│   ├── models/
│   │   ├── UserModel.php            # Acesso a dados: utilizadores
│   │   └── WeatherModel.php         # Cache, favoritos, histórico, alertas
│   └── controllers/
│       ├── AuthController.php       # Lógica de autenticação
│       └── WeatherController.php    # Lógica de clima + exportação
│
└── database/
    └── schema.sql                   # Schema completo da base de dados
```

---

## 🚀 Instalação

### 1. Base de Dados
```sql
-- Execute no MySQL/MariaDB:
SOURCE database/schema.sql;
```

### 2. Backend
Configure as credenciais da BD em `backend/config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ajuba_previsao');
define('DB_USER', 'root');
define('DB_PASS', '');
```

Coloque a pasta `backend/` num servidor com PHP 8.0+ e Apache com mod_rewrite.

### 3. Frontend
Abra `frontend/index.html` num servidor web (ou configure o `API_BASE` em `services/api.js`).

Para desenvolvimento local com XAMPP/WAMP:
- Coloque o projeto em `htdocs/a-juba-que-preve/`
- Acesse: `http://localhost/a-juba-que-preve/frontend/`

---

## ✅ Funcionalidades Implementadas

| Requisito                         | Status |
|----------------------------------|--------|
| Autenticação completa (register/login/logout/reset) | ✅ |
| Base de dados relacional (5 tabelas + CRUD) | ✅ |
| Integração com OpenWeatherMap API | ✅ |
| Interface responsiva              | ✅ |
| Modo claro e modo escuro          | ✅ |
| Suporte a múltiplos idiomas (PT/EN) | ✅ |
| Exportação de dados (CSV)         | ✅ |
| Distinção de tipos de utilizadores (admin/user) | ✅ |
| Permissões diferenciadas          | ✅ |
| Histórico de pesquisas            | ✅ |
| Cidades favoritas                 | ✅ |
| Alertas de clima                  | ✅ |
| Previsão de 5 dias                | ✅ |
| Pesquisa por geolocalização       | ✅ |
| Cache de requisições à API        | ✅ |

---

## 🔐 Credenciais Demo (Admin)
- **Email:** `admin@ajuba.ao`
- **Senha:** `admin123`

---

## 🛠️ Tecnologias
- **Frontend:** HTML5, CSS3, JavaScript (ES6+ modular)
- **Backend:** PHP 8.0+ (puro, sem frameworks)
- **Base de Dados:** MySQL / MariaDB
- **API:** OpenWeatherMap (Current + Forecast)
- **Autenticação:** JWT (implementação própria)
- **Exportação:** CSV via PHP

---

## 📡 Endpoints da API Backend

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registo de utilizador |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Utilizador atual |
| POST | `/auth/forgot-password` | Solicitar reset |
| POST | `/auth/reset-password` | Redefinir senha |
| PUT | `/auth/preferences` | Guardar preferências |
| GET | `/weather/current?city=` | Clima atual |
| GET | `/weather/forecast?city=` | Previsão 5 dias |
| GET | `/weather/coords?lat=&lon=` | Clima por coordenadas |
| GET | `/favorites` | Listar favoritos |
| POST | `/favorites` | Adicionar favorito |
| DELETE | `/favorites?id=` | Remover favorito |
| GET | `/history` | Histórico de pesquisas |
| GET | `/history/export` | Exportar CSV |
| GET | `/alerts` | Listar alertas |
| POST | `/alerts` | Criar alerta |
| DELETE | `/alerts?id=` | Remover alerta |
| GET | `/admin/users` | Listar utilizadores (admin) |

---

*ISPTEC — Licenciatura em Engenharia Informática — 2025/2026*
