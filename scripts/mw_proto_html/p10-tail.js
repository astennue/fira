/* ═══ Boot ═══ */
(function boot() {
  applyTheme(getTheme());
  restoreSession();
  if (!location.hash) location.hash = S.user ? ROLE_HOME[S.user.role] : '#/login';
  render();
})();
