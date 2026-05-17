// assets/js/app.js — Controlador Principal da Aplicação
const App = (() => {

  let _t          = window.LANG_PT;
  let _lang       = 'pt';
  let _theme      = 'dark';
  let _currentWeather = null;
  let _favorites  = [];

  // ================================================================
  // Boot
  // ================================================================
  async function init() {
    // Carregar preferências guardadas
    _lang  = localStorage.getItem('ajuba_lang')  || 'pt';
    _theme = localStorage.getItem('ajuba_theme') || 'dark';
    applyLang(_lang);
    applyTheme(_theme);

    if (!Auth.isLoggedIn()) {
      showAuthPage();
    } else {
      await loadApp();
    }
  }

  async function loadApp() {
    renderApp();
    await loadFavorites();
    navigate('home');
  }

  // ================================================================
  // i18n
  // ================================================================
  function applyLang(lang) {
    _lang = lang;
    _t    = lang === 'en' ? window.LANG_EN : window.LANG_PT;
    localStorage.setItem('ajuba_lang', lang);
  }

  function t(key) { return _t[key] || key; }

  // ================================================================
  // Tema
  // ================================================================
  function applyTheme(theme) {
    _theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ajuba_theme', theme);
  }

  function toggleTheme() {
    applyTheme(_theme === 'dark' ? 'light' : 'dark');
  }

  // ================================================================
  // Auth Page
  // ================================================================
  function showAuthPage() {
    document.getElementById('app').innerHTML = renderAuthPage();
    bindAuthEvents();
  }

  function renderAuthPage() {
    return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo">
            <div class="brand-logo">🦁</div>
            <div class="brand-name">${t('appName')}</div>
            <p>${t('tagline')}</p>
          </div>
          <div class="auth-tabs" id="auth-tabs">
            <button class="auth-tab active" onclick="App.switchAuthTab('login')">${t('login')}</button>
            <button class="auth-tab" onclick="App.switchAuthTab('register')">${t('register')}</button>
          </div>
          <div id="auth-form-container">${renderLoginForm()}</div>
        </div>
      </div>`;
  }

  function renderLoginForm() {
    return `
      <div class="form-group">
        <label class="form-label">${t('email')}</label>
        <input class="form-input" type="email" id="login-email" placeholder="email@exemplo.com">
      </div>
      <div class="form-group">
        <label class="form-label">${t('password')}</label>
        <input class="form-input" type="password" id="login-pass" placeholder="••••••">
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="App.doLogin()">${t('login')}</button>
      <p style="text-align:center;margin-top:1rem;font-size:.85rem">
        <a href="#" onclick="App.showForgot(event)" style="color:var(--text2)">${t('forgotPassword')}</a>
      </p>`;
  }

  function renderRegisterForm() {
    return `
      <div class="form-group">
        <label class="form-label">${t('name')}</label>
        <input class="form-input" type="text" id="reg-name" placeholder="João Silva">
      </div>
      <div class="form-group">
        <label class="form-label">${t('email')}</label>
        <input class="form-input" type="email" id="reg-email" placeholder="email@exemplo.com">
      </div>
      <div class="form-group">
        <label class="form-label">${t('password')}</label>
        <input class="form-input" type="password" id="reg-pass" placeholder="Mín. 6 caracteres">
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="App.doRegister()">${t('register')}</button>`;
  }

  function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((b, i) => b.classList.toggle('active', (tab === 'login') === (i === 0)));
    document.getElementById('auth-form-container').innerHTML =
      tab === 'login' ? renderLoginForm() : renderRegisterForm();
  }

  function showForgot(e) {
    e?.preventDefault();
    document.getElementById('auth-form-container').innerHTML = `
      <p style="color:var(--text2);font-size:.88rem;margin-bottom:1rem">${t('forgotPassword')}</p>
      <div class="form-group">
        <label class="form-label">${t('email')}</label>
        <input class="form-input" type="email" id="forgot-email" placeholder="email@exemplo.com">
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="App.doForgot()">${t('sendReset')}</button>
      <p style="text-align:center;margin-top:1rem"><a href="#" onclick="App.switchAuthTab('login');return false" style="color:var(--text2);font-size:.85rem">${t('back')}</a></p>`;
  }

  function bindAuthEvents() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const login = document.getElementById('login-pass') || document.getElementById('reg-pass');
        if (login) {
          const tab = document.querySelector('.auth-tab.active')?.textContent;
          if (tab === t('login')) doLogin();
          else doRegister();
        }
      }
    });
  }

  // ================================================================
  // Auth Actions
  // ================================================================
  async function doLogin() {
    const email = document.getElementById('login-email')?.value.trim();
    const pass  = document.getElementById('login-pass')?.value;
    if (!email || !pass) return Modal.toast(t('error'), 'error');
    try {
      const res = await Api.login(email, pass);
      Auth.setSession(res.token, res.user);
      applyLang(res.user.language || 'pt');
      applyTheme(res.user.theme || 'dark');
      Modal.toast(t('loginSuccess'), 'success');
      await loadApp();
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  async function doRegister() {
    const name  = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const pass  = document.getElementById('reg-pass')?.value;
    if (!name || !email || !pass) return Modal.toast(t('error'), 'error');
    try {
      const res = await Api.register(name, email, pass);
      Auth.setSession(res.token, res.user);
      Modal.toast(t('registerSuccess'), 'success');
      await loadApp();
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  async function doForgot() {
    const email = document.getElementById('forgot-email')?.value.trim();
    if (!email) return Modal.toast(t('error'), 'error');
    try {
      const res = await Api.forgot(email);
      Modal.toast(res.message, 'info');
      if (res.reset_token) {
        console.info('[Demo] Reset token:', res.reset_token);
        Modal.toast(`Token (demo): ${res.reset_token.slice(0,12)}...`, 'info', 7000);
      }
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  function doLogout() {
    Auth.clearSession();
    showAuthPage();
  }

  // ================================================================
  // App Shell
  // ================================================================
  function renderApp() {
    const user    = Auth.getUser();
    const initial = user?.name?.[0]?.toUpperCase() || 'U';
    const isAdmin = Auth.isAdmin();

    document.getElementById('app').innerHTML = `
      <div class="bg-gradient"></div>
      <nav class="navbar">
        <a class="navbar-brand" href="#" onclick="App.navigate('home');return false">
          <div class="brand-logo">🦁</div>
          <div>
            <div class="brand-name">${t('appName')}</div>
            <div class="brand-tagline">${t('tagline')}</div>
          </div>
        </a>
        <div class="navbar-actions">
          <button class="nav-icon-btn" onclick="App.toggleTheme()" title="${t('theme')}">
            ${_theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button class="nav-icon-btn" onclick="App.toggleLang()" title="${t('language')}">
            ${_lang === 'pt' ? '🇵🇹' : '🇬🇧'}
          </button>
          <div class="nav-user">
            <div class="nav-avatar" title="${user?.name || ''}">${initial}</div>
            <span class="hidden" style="display:none" id="nav-username">${user?.name || ''}</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('settings')">⚙️</button>
          <button class="btn btn-ghost btn-sm" onclick="App.doLogout()">← ${t('logout')}</button>
        </div>
      </nav>

      <div class="main-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <h4>Menu</h4>
            <div class="sidebar-item active" id="nav-home" onclick="App.navigate('home')">
              <span class="icon">🏠</span> Home
            </div>
            <div class="sidebar-item" id="nav-favorites" onclick="App.navigate('favorites')">
              <span class="icon">♥</span> ${t('favorites')}
            </div>
            <div class="sidebar-item" id="nav-history" onclick="App.navigate('history')">
              <span class="icon">🕒</span> ${t('history')}
            </div>
            <div class="sidebar-item" id="nav-alerts" onclick="App.navigate('alerts')">
              <span class="icon">🔔</span> ${t('alerts')}
            </div>
            <div class="sidebar-item" id="nav-settings" onclick="App.navigate('settings')">
              <span class="icon">⚙️</span> ${t('settings')}
            </div>
            ${isAdmin ? `<div class="sidebar-item" id="nav-admin" onclick="App.navigate('admin')">
              <span class="icon">👑</span> ${t('admin')}
            </div>` : ''}
          </div>
          <div class="sidebar-section" id="sidebar-favs">
            <h4>${t('favorites')}</h4>
            <div id="sidebar-fav-list"><p style="color:var(--text2);font-size:.8rem;padding:0 .5rem">${t('noFavorites')}</p></div>
          </div>
        </aside>

        <!-- Content -->
        <main class="content-area" id="content-area"></main>
      </div>

      <div id="toast-container"></div>`;
  }

  // ================================================================
  // Navigation / Router
  // ================================================================
  function navigate(page) {
    // Update active nav
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${page}`)?.classList.add('active');

    const content = document.getElementById('content-area');
    if (!content) return;

    switch (page) {
      case 'home':      renderHome(content);     break;
      case 'favorites': renderFavorites(content); break;
      case 'history':   renderHistory(content);   break;
      case 'alerts':    renderAlerts(content);     break;
      case 'settings':  renderSettings(content);   break;
      case 'admin':     renderAdmin(content);       break;
    }
  }

  // ================================================================
  // Home Page — Pesquisa
  // ================================================================
  function renderHome(container) {
    container.innerHTML = `
      <div class="search-bar">
        <span>🔍</span>
        <input type="text" id="search-input" placeholder="${t('search')}" onkeydown="App.handleSearchKey(event)">
        <button onclick="App.doSearch()" title="Pesquisar">→</button>
        <button onclick="App.useGeo()" title="${t('locate')}">📍</button>
      </div>
      <div id="weather-result">
        <div class="placeholder-text">
          <div style="font-size:4rem;margin-bottom:1rem">🦁</div>
          <p>${t('noCity')}</p>
        </div>
      </div>`;

    if (_currentWeather) {
      displayWeather(_currentWeather.current, _currentWeather.forecast);
    }
    document.getElementById('search-input')?.focus();
  }

  function handleSearchKey(e) {
    if (e.key === 'Enter') doSearch();
  }

  async function doSearch() {
    const input = document.getElementById('search-input');
    const city  = input?.value.trim();
    if (!city) return;

    const result = document.getElementById('weather-result');
    result.innerHTML = `<div class="loading-center"><div class="spinner"></div><span>${t('loading')}</span></div>`;

    try {
      const [cur, fct] = await Promise.all([
        Api.current(city, _lang),
        Api.forecast(city, _lang)
      ]);
      _currentWeather = { current: cur.data, forecast: fct.data };
      displayWeather(cur.data, fct.data);
    } catch (err) {
      result.innerHTML = `<div class="empty-state"><div class="empty-icon">🌧️</div><p>${err.message}</p></div>`;
    }
  }

  async function useGeo() {
    if (!navigator.geolocation) return Modal.toast(t('geoError'), 'error');
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const cur = await Api.byCoords(lat, lon, _lang);
        const fct = await Api.forecast(cur.data.name, _lang);
        _currentWeather = { current: cur.data, forecast: fct.data };
        if (document.getElementById('search-input')) {
          document.getElementById('search-input').value = cur.data.name;
        }
        displayWeather(cur.data, fct.data);
      } catch (err) { Modal.toast(err.message, 'error'); }
    }, () => Modal.toast(t('geoError'), 'error'));
  }

  function displayWeather(current, forecast) {
    const result = document.getElementById('weather-result');
    if (!result) return;
    const isFav = _favorites.some(f => f.city_name === current.name);
    result.innerHTML =
      WeatherCard.renderCurrent(current, _t, isFav) +
      WeatherCard.renderForecast(forecast, _t);
  }

  // ================================================================
  // Favorites
  // ================================================================
  async function loadFavorites() {
    try {
      const res   = await Api.getFavorites();
      _favorites  = res.favorites;
      renderSidebarFavs();
    } catch (_) {}
  }

  function renderSidebarFavs() {
    const list = document.getElementById('sidebar-fav-list');
    if (!list) return;
    if (!_favorites.length) {
      list.innerHTML = `<p style="color:var(--text2);font-size:.8rem;padding:0 .5rem">${t('noFavorites')}</p>`;
      return;
    }
    list.innerHTML = _favorites.map(f => `
      <div class="city-chip" title="${f.city_name}">
        <span onclick="App.searchCity('${f.city_name}')">${f.city_name}, ${f.country}</span>
        <button class="remove-btn" onclick="App.removeFavById(${f.id})">×</button>
      </div>`).join('');
  }

  async function addFav() {
    if (!_currentWeather) return;
    const d = _currentWeather.current;
    try {
      await Api.addFavorite(d.name, d.sys.country, d.coord.lat, d.coord.lon);
      Modal.toast(`${d.name} ${t('addFavorite')} ✓`, 'success');
      await loadFavorites();
      displayWeather(d, _currentWeather.forecast);
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  async function removeFav() {
    if (!_currentWeather) return;
    const name = _currentWeather.current.name;
    const fav  = _favorites.find(f => f.city_name === name);
    if (fav) await removeFavById(fav.id);
  }

  async function removeFavById(id) {
    try {
      await Api.removeFavorite(id);
      await loadFavorites();
      if (_currentWeather) displayWeather(_currentWeather.current, _currentWeather.forecast);
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  async function renderFavorites(container) {
    await loadFavorites();
    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">♥ ${t('favorites')}</h2>
      </div>
      <div class="list-card">
        ${!_favorites.length
          ? `<div class="empty-state"><div class="empty-icon">♡</div><p>${t('noFavorites')}</p></div>`
          : _favorites.map(f => `
              <div class="list-item">
                <div class="list-item-info">
                  <span class="list-item-title">${f.city_name}</span>
                  <span class="list-item-sub">${f.country} • ${f.lat}, ${f.lon}</span>
                </div>
                <div class="list-item-actions">
                  <button class="btn btn-ghost btn-sm" onclick="App.searchCity('${f.city_name}')">🔍 Ver</button>
                  <button class="btn btn-danger btn-sm" onclick="App.removeFavById(${f.id})">×</button>
                </div>
              </div>`).join('')}
      </div>`;
  }

  async function searchCity(city) {
    navigate('home');
    setTimeout(async () => {
      const input = document.getElementById('search-input');
      if (input) { input.value = city; await doSearch(); }
    }, 100);
  }

  // ================================================================
  // History
  // ================================================================
  async function renderHistory(container) {
    container.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const res = await Api.getHistory();
      const h   = res.history;
      container.innerHTML = `
        <div class="page-header">
          <h2 class="page-title">🕒 ${t('history')}</h2>
          <a href="${Api.exportCSV()}" class="btn btn-ghost btn-sm" download>⬇ ${t('export')}</a>
        </div>
        <div class="list-card">
          ${!h.length
            ? `<div class="empty-state"><div class="empty-icon">🕒</div><p>${t('noHistory')}</p></div>`
            : h.map(item => `
                <div class="list-item">
                  <div class="list-item-info">
                    <span class="list-item-title">${item.city_name}</span>
                    <span class="list-item-sub">${item.country} • ${item.searched_at}</span>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="App.searchCity('${item.city_name}')">🔍</button>
                </div>`).join('')}
        </div>`;
    } catch (err) { container.innerHTML = `<p class="placeholder-text">${err.message}</p>`; }
  }

  // ================================================================
  // Alerts
  // ================================================================
  async function renderAlerts(container) {
    container.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const res = await Api.getAlerts();
      const a   = res.alerts;
      container.innerHTML = `
        <div class="page-header">
          <h2 class="page-title">🔔 ${t('alerts')}</h2>
          <button class="btn btn-primary btn-sm" onclick="App.showAlertModal()">+ ${t('addAlert')}</button>
        </div>
        <div class="list-card">
          ${!a.length
            ? `<div class="empty-state"><div class="empty-icon">🔔</div><p>${t('noAlerts')}</p></div>`
            : a.map(item => `
                <div class="list-item">
                  <div class="list-item-info">
                    <span class="list-item-title">${item.city_name}, ${item.country}</span>
                    <span class="list-item-sub">${item.condition}${item.threshold ? ' • ' + item.threshold + '°C' : ''}</span>
                  </div>
                  <button class="btn btn-danger btn-sm" onclick="App.deleteAlert(${item.id})">× ${t('delete')}</button>
                </div>`).join('')}
        </div>`;
    } catch (err) { container.innerHTML = `<p class="placeholder-text">${err.message}</p>`; }
  }

  function showAlertModal() {
    Modal.create('alert-modal', `🔔 ${t('addAlert')}`, `
      <div class="form-group">
        <label class="form-label">${t('search')}</label>
        <input class="form-input" id="alert-city" placeholder="Luanda" value="${_currentWeather?.current?.name || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('alertCondition')}</label>
        <select class="form-input form-select" id="alert-cond">
          <option value="rain">${t('rain')}</option>
          <option value="storm">${t('storm')}</option>
          <option value="snow">${t('snow')}</option>
          <option value="temp_above">${t('tempAbove')}</option>
          <option value="temp_below">${t('tempBelow')}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${t('alertThreshold')}</label>
        <input class="form-input" type="number" id="alert-threshold" placeholder="ex: 35">
      </div>`,
      `<button class="btn btn-ghost" onclick="Modal.hide('alert-modal')">${t('cancel')}</button>
       <button class="btn btn-primary" onclick="App.doAddAlert()">${t('save')}</button>`);
    Modal.show('alert-modal');
  }

  async function doAddAlert() {
    const city      = document.getElementById('alert-city')?.value.trim();
    const condition = document.getElementById('alert-cond')?.value;
    const threshold = document.getElementById('alert-threshold')?.value;
    if (!city) return Modal.toast(t('error'), 'error');
    try {
      await Api.addAlert(city, '', condition, threshold ? parseFloat(threshold) : null);
      Modal.hide('alert-modal');
      Modal.toast(t('addAlert') + ' ✓', 'success');
      navigate('alerts');
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  async function deleteAlert(id) {
    try {
      await Api.deleteAlert(id);
      navigate('alerts');
    } catch (err) { Modal.toast(err.message, 'error'); }
  }

  // ================================================================
  // Settings
  // ================================================================
  function renderSettings(container) {
    const user = Auth.getUser();
    container.innerHTML = `
      <h2 class="page-title" style="margin-bottom:1.5rem">⚙️ ${t('settings')}</h2>
      <div class="settings-grid">
        <div class="settings-card">
          <h4>${t('theme')}</h4>
          <div class="toggle-group">
            <button class="toggle-btn ${_theme === 'dark' ? 'active' : ''}" onclick="App.setTheme('dark')">🌙 ${t('dark')}</button>
            <button class="toggle-btn ${_theme === 'light' ? 'active' : ''}" onclick="App.setTheme('light')">☀️ ${t('light')}</button>
          </div>
        </div>
        <div class="settings-card">
          <h4>${t('language')}</h4>
          <div class="toggle-group">
            <button class="toggle-btn ${_lang === 'pt' ? 'active' : ''}" onclick="App.setLang('pt')">🇵🇹 Português</button>
            <button class="toggle-btn ${_lang === 'en' ? 'active' : ''}" onclick="App.setLang('en')">🇬🇧 English</button>
          </div>
        </div>
        <div class="settings-card">
          <h4>👤 Perfil</h4>
          <p style="color:var(--text2);font-size:.88rem">${user?.name} • ${user?.email}</p>
          <p style="color:var(--text2);font-size:.78rem;margin-top:.5rem">Perfil: <strong>${user?.role}</strong></p>
        </div>
      </div>`;
  }

  async function setTheme(theme) {
    applyTheme(theme);
    renderApp();
    await loadFavorites();
    navigate('settings');
    try { await Api.savePrefs(_lang, theme); } catch (_) {}
  }

  async function setLang(lang) {
    applyLang(lang);
    renderApp();
    await loadFavorites();
    navigate('settings');
    try { await Api.savePrefs(lang, _theme); } catch (_) {}
  }

  function toggleLang() {
    setLang(_lang === 'pt' ? 'en' : 'pt');
  }

  // ================================================================
  // Admin
  // ================================================================
  async function renderAdmin(container) {
    if (!Auth.isAdmin()) {
      container.innerHTML = `<p class="placeholder-text">🚫 Acesso negado</p>`;
      return;
    }
    container.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const res = await Api.adminUsers();
      container.innerHTML = `
        <div class="page-header">
          <h2 class="page-title">👑 ${t('admin')} — ${t('users')}</h2>
        </div>
        <div class="list-card" style="overflow:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>${t('name')}</th>
                <th>${t('email')}</th>
                <th>${t('role')}</th>
                <th>${t('language')}</th>
                <th>${t('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              ${res.users.map(u => `
                <tr>
                  <td style="font-family:'Space Mono',monospace;font-size:.78rem">#${u.id}</td>
                  <td>${u.name}</td>
                  <td style="color:var(--text2)">${u.email}</td>
                  <td><span class="badge badge-${u.role}">${u.role}</span></td>
                  <td>${u.language}</td>
                  <td style="font-size:.78rem;color:var(--text2)">${u.created_at}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) { container.innerHTML = `<p class="placeholder-text">${err.message}</p>`; }
  }

  // ================================================================
  // Public API
  // ================================================================
  return {
    init, navigate,
    toggleTheme, setTheme, setLang, toggleLang,
    doLogin, doRegister, doForgot, doLogout,
    switchAuthTab, showForgot,
    doSearch, handleSearchKey, useGeo, searchCity,
    addFav, removeFav, removeFavById,
    showAlertModal, doAddAlert, deleteAlert,
  };
})();

// Boot ao carregar a página
document.addEventListener('DOMContentLoaded', () => App.init());
