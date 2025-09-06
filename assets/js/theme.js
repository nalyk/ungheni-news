/**
 * Theme Toggle - Critical functionality, loaded immediately
 * Minimal, performance-optimized theme switching
 */
(() => {
  'use strict';
  
  const THEME_KEY = 'theme';
  const THEMES = { light: 'dark', dark: 'light' };
  
  // Apply stored theme immediately to prevent FOUC
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme && storedTheme in THEMES) {
    document.documentElement.dataset.theme = storedTheme;
  }
  
  // Use event delegation for efficiency
  document.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-action="toggle-theme"]');
    if (!toggleButton) return;
    
    event.preventDefault();
    
    const currentTheme = document.documentElement.dataset.theme || 'light';
    const nextTheme = THEMES[currentTheme] || 'light';
    
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    
    // Dispatch custom event for other components that might need to know
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: nextTheme } 
    }));
  }, { passive: false });
})();

