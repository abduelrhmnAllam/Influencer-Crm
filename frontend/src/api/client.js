import axios from 'axios';

/**
 * Axios instance configured for Laravel Sanctum stateful cookie authentication.
 * 
 * IMPORTANT: `withCredentials: true` is required for HttpOnly cookies to be
 * sent and received across the frontend ↔ backend boundary.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * CSRF Token Interceptor
 * Before any state-mutating request (POST, PUT, PATCH, DELETE),
 * fetch a fresh CSRF cookie from `/sanctum/csrf-cookie`.
 * This is a Sanctum requirement for stateful SPA authentication.
 */
let csrfCookieFetched = false;

api.interceptors.request.use(async (config) => {
  const mutatingMethods = ['post', 'put', 'patch', 'delete'];

  if (mutatingMethods.includes(config.method) && !csrfCookieFetched) {
    await axios.get(
      (import.meta.env.VITE_API_URL || '') + '/sanctum/csrf-cookie',
      { withCredentials: true }
    );
    csrfCookieFetched = true;
  }

  return config;
});

/**
 * Response Interceptor
 * Handle 401 (unauthenticated) globally — redirect to login page.
 * Handle 419 (CSRF token mismatch) — refetch CSRF cookie and retry.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // CSRF token expired → refetch and retry once
    if (response?.status === 419 && !config._retried) {
      config._retried = true;
      csrfCookieFetched = false;
      await axios.get(
        (import.meta.env.VITE_API_URL || '') + '/sanctum/csrf-cookie',
        { withCredentials: true }
      );
      csrfCookieFetched = true;
      return api(config);
    }

    // Unauthenticated → let the auth store handle redirect
    if (response?.status === 401) {
      // The authStore listener will handle the redirect to /login
      csrfCookieFetched = false;
    }

    return Promise.reject(error);
  }
);

/**
 * Reset CSRF state (call on logout)
 */
export function resetCsrf() {
  csrfCookieFetched = false;
}

export default api;
