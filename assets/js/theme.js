(() => {
  const key = 'theme';
  const prefer = localStorage.getItem(key);
  if (prefer) document.documentElement.dataset.theme = prefer;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action="toggle-theme"]');
    if (!t) return;
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(key, next);
  });
})();

