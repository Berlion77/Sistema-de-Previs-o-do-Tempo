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
    if (stored) _user = JSON.parse(stored);
    return _user;
  }

  function isLoggedIn() {
    return !!localStorage.getItem('ajuba_token');
  }

  function isAdmin() {
    const u = getUser();
    return u && u.role === 'admin';
  }

  return { setSession, clearSession, getUser, isLoggedIn, isAdmin };
})();
