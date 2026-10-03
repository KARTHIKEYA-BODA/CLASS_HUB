/**
 * ClassHub API Client
 * Thin wrapper around fetch() that automatically attaches the JWT token,
 * handles JSON parsing, and standardizes error handling.
 */
const ChAPI = (() => {
  const getToken = () => localStorage.getItem('ch_token');

  const request = async (endpoint, options = {}) => {
    const url = `${CH_CONFIG.API_BASE_URL}${endpoint}`;
    const token = getToken();

    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url, { ...options, headers });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { success: false, message: 'Unexpected server response.' };
      }

      if (res.status === 401) {
        // Token invalid/expired -> force re-login
        if (window.ChAuth && typeof window.ChAuth.logout === 'function') {
          window.ChAuth.logout(true);
        }
      }

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      throw err;
    }
  };

  const get = (endpoint) => request(endpoint, { method: 'GET' });
  const post = (endpoint, body) => request(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
  const put = (endpoint, body) => request(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) });
  const del = (endpoint) => request(endpoint, { method: 'DELETE' });

  return { get, post, put, delete: del };
})();
