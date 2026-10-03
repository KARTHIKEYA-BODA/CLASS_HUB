/**
 * ClassHub Theme Manager (Light / Dark mode)
 */
const ChTheme = (() => {
  const KEY = 'ch_theme';

  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    updateIcons(theme);
  };

  const updateIcons = (theme) => {
    document.querySelectorAll('.ch-theme-icon').forEach(icon => {
      icon.className = `ch-theme-icon bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`;
    });
  };

  const init = () => {
    const saved = localStorage.getItem(KEY) ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    apply(saved);

    document.querySelectorAll('.ch-theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  };

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
  };

  return { init, toggle };
})();

document.addEventListener('DOMContentLoaded', ChTheme.init);
