// services/theme.js - Gerenciamento de tema com suporte a sistema
const Theme = (() => {
  let currentTheme = localStorage.getItem('ajuba_theme') || 'system';
  
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function applyTheme(theme) {
    let finalTheme = theme;
    if (theme === 'system') {
      finalTheme = getSystemTheme();
    }
    
    document.documentElement.setAttribute('data-theme', finalTheme);
    currentTheme = theme;
    localStorage.setItem('ajuba_theme', theme);
    
    // Disparar evento para outros componentes
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: finalTheme } }));
  }
  
  function init() {
    applyTheme(currentTheme);
    
    // Ouvir mudanças no tema do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
  }
  
  function getCurrentTheme() {
    return currentTheme;
  }
  
  function getAppliedTheme() {
    return document.documentElement.getAttribute('data-theme');
  }
  
  return { init, applyTheme, getCurrentTheme, getAppliedTheme };
})();

// Inicializar tema antes de tudo
Theme.init();