export const themes = {
  rose: {
    name: '🌸 Rose Élégant',
    primary: '#c2185b',
    primaryDark: '#880e4f',
    noir: '#1a1a2e',
    creme: '#f5f0eb',
    navbar: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  gold: {
    name: '✨ Noir & Or',
    primary: '#d4af37',
    primaryDark: '#b8960c',
    noir: '#0d0d0d',
    creme: '#f5f0eb',
    navbar: '#0d0d0d',
  },
  ocean: {
    name: '🌊 Bleu Océan',
    primary: '#1e88e5',
    primaryDark: '#1565c0',
    noir: '#0d1b2a',
    creme: '#f0f7ff',
    navbar: 'linear-gradient(135deg, #0d1b2a, #1565c0)',
  },
  emeraude: {
    name: '🌿 Vert Émeraude',
    primary: '#43a047',
    primaryDark: '#2e7d32',
    noir: '#1a2e1a',
    creme: '#f1f8f1',
    navbar: 'linear-gradient(135deg, #1a2e1a, #2e7d32)',
  },
  royal: {
    name: '👑 Or Royal',
    primary: '#d4af37',
    primaryDark: '#b8960c',
    noir: '#1a1400',
    creme: '#fffdf0',
    navbar: 'linear-gradient(135deg, #1a1400, #b8960c)',
  }
};

export const applyTheme = (themeKey) => {
  const theme = themes[themeKey];
  if (!theme) return;

  const root = document.documentElement;

  // Mise à jour des variables CSS globales
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--primary-light', `${theme.primary}18`);
  root.style.setProperty('--noir', theme.noir);
  root.style.setProperty('--creme', theme.creme);

  // Mise à jour dynamique des éléments
  document.querySelectorAll('.navbar').forEach(el => {
    el.style.background = theme.navbar;
  });

  document.querySelectorAll('.btn-primary').forEach(el => {
    el.style.background = theme.noir;
    el.style.color = theme.primary;
    el.style.borderColor = theme.primary;
  });

  document.querySelectorAll('.data-table thead tr').forEach(el => {
    el.style.background = theme.noir;
  });

  document.querySelectorAll('.modal-header').forEach(el => {
    el.style.background = theme.noir;
  });

  document.querySelectorAll('.kpi').forEach(el => {
    el.style.background = theme.noir;
  });

  document.body.style.background = theme.creme;

  localStorage.setItem('theme', themeKey);
  localStorage.setItem('themeData', JSON.stringify(theme));
};

export const loadSavedTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'gold';
  applyTheme(savedTheme);
};