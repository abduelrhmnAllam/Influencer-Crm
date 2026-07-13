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

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export function resetCsrf() {
  setAuthToken(null);
}

export default api;