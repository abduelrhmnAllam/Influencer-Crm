import axios from 'axios';

const AUTH_TOKEN_KEY = 'smartcode_auth_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfCookieFetched = false;

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

const existingToken = getAuthToken();
if (existingToken) {
  api.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

api.interceptors.request.use(async (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (response?.status === 419 && !config._retried && !getAuthToken()) {
      config._retried = true;
      csrfCookieFetched = false;
      await axios.get(
        (import.meta.env.VITE_API_URL || '') + '/sanctum/csrf-cookie',
        { withCredentials: true }
      );
      csrfCookieFetched = true;
      return api(config);
    }

    if (response?.status === 401) {
      csrfCookieFetched = false;
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export function resetCsrf() {
  csrfCookieFetched = false;
  setAuthToken(null);
}

export default api;