/**
 * ClassHub Auth Helper
 * Manages token/user storage, route guarding by role, and logout.
 */
const ChAuth = (() => {
  const TOKEN_KEY = "ch_token";
  const USER_KEY = "ch_user";
  const authScript =
    document.currentScript ||
    [...document.scripts].find(({ src }) => src.endsWith("/js/auth.js"));
  const loginPageUrl = new URL(
    "../login.html",
    authScript?.src || window.location.href,
  );

  const redirectToLogin = (expired = false) => {
    const url = new URL(loginPageUrl);
    if (expired) url.searchParams.set("expired", "1");
    window.location.href = url.href;
  };

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const getUser = () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  };

  const isLoggedIn = () => !!getToken();

  const logout = (expired = false) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    redirectToLogin(expired);
  };

  /**
   * Call at the top of every dashboard page.
   * Redirects to login if not authenticated, or to correct dashboard if wrong role.
   */
  const guard = (requiredRole) => {
    const user = getUser();
    if (!isLoggedIn() || !user) {
      redirectToLogin();
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      window.location.href = `${user.role}/dashboard.html`;
      return null;
    }
    return user;
  };

  return { setSession, getToken, getUser, isLoggedIn, logout, guard };
})();
