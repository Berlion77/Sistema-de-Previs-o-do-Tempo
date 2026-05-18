// services/auth.js — Gestão de estado de autenticação
const Auth = (() => {
  let _user = null;

  function setSession(token, user) {
    localStorage.setItem('ajuba_token', token);
    localStorage.setItem('ajuba_user', JSON.stringify(user));
    _user = user;
  }

  function clearSession() {
    localStorage.removeItem('ajuba_token');
    localStorage.removeItem('ajuba_user');
    _user = null;
  }

  function getUser() {
    if (_user) return _user;
    const stored = localStorage.getItem('ajuba_user');
    if (stored && stored !== 'undefined') {
      try {
        _user = JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao fazer parse do usuário:', e);
        _user = null;
      }
    }
    return _user;
  }

  function isLoggedIn() {
    const token = localStorage.getItem('ajuba_token');
    return token && token !== 'undefined' && token !== null;
  }

  function isAdmin() {
    const u = getUser();
    return u && u.role === 'admin';
  }

  return { setSession, clearSession, getUser, isLoggedIn, isAdmin };
})();
