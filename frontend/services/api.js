// services/api.js — Comunicação com o Backend PHP
// AJUSTE ESTA LINHA PARA O CAMINHO CORRETO
const API_BASE = '/a-juba-que-preve/backend/index.php';

const Api = (() => {
  function getToken() {
    return localStorage.getItem('ajuba_token') || '';
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }

  async function request(method, path, body = null, rawResponse = false) {
    const opts = { 
      method, 
      headers: authHeaders() 
    };
    if (body) opts.body = JSON.stringify(body);
    
    const url = API_BASE + path;
    console.log('[API] Request:', method, url); // Para debug
    
    try {
      const res = await fetch(url, opts);
      
      if (rawResponse) return res;
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      return data;
    } catch (error) {
      console.error('[API] Error:', error);
      throw error;
    }
  }

  return {
    // Auth
    register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
    login: (email, password) => request('POST', '/auth/login', { email, password }),
    me: () => request('GET', '/auth/me'),
    forgot: (email) => request('POST', '/auth/forgot-password', { email }),
    reset: (token, password) => request('POST', '/auth/reset-password', { token, password }),
    savePrefs: (language, theme) => request('PUT', '/auth/preferences', { language, theme }),

    // Weather
    current: (city, lang) => request('GET', `/weather/current?city=${encodeURIComponent(city)}&lang=${lang}`),
    forecast: (city, lang) => request('GET', `/weather/forecast?city=${encodeURIComponent(city)}&lang=${lang}`),
    byCoords: (lat, lon, lang) => request('GET', `/weather/coords?lat=${lat}&lon=${lon}&lang=${lang}`),

    // Favorites
    getFavorites: () => request('GET', '/favorites'),
    addFavorite: (city, country, lat, lon) => request('POST', '/favorites', { city, country, lat, lon }),
    removeFavorite: (id) => request('DELETE', `/favorites?id=${id}`),

    // History
    getHistory: () => request('GET', '/history'),
    exportCSV: () => `${API_BASE}/history/export?token=${getToken()}`,

    // Alerts
    getAlerts: () => request('GET', '/alerts'),
    addAlert: (city, country, condition, threshold) => request('POST', '/alerts', { city, country, condition, threshold }),
    deleteAlert: (id) => request('DELETE', `/alerts?id=${id}`),

    // Admin
    adminUsers: () => request('GET', '/admin/users'),
  };
})();