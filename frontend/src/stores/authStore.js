import { create } from 'zustand';
import api, { resetCsrf } from '../api/client';

/**
 * Authentication Store (Zustand)
 * 
 * Manages the current authenticated user state, roles, permissions,
 * and login/logout operations via Sanctum stateful cookie sessions.
 */
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  loading: true,
  error: null,

  /**
   * Fetch the current authenticated user from the backend.
   * Called on app initialization to check if a valid session cookie exists.
   */
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/v1/auth/me');
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      set({ user: null, loading: false });
      return null;
    }
  },

  /**
   * Login with username and password.
   * On success, stores user data and returns it.
   * On failure, sets error message.
   */
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/v1/auth/login', { username, password });
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      const message = err.response?.data?.errors?.username?.[0]
        || err.response?.data?.error
        || err.response?.data?.message
        || 'حدث خطأ في تسجيل الدخول';
      set({ user: null, loading: false, error: message });
      throw err;
    }
  },

  /**
   * Logout the current user.
   * Invalidates the session cookie and clears local state.
   */
  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Even if the request fails, clear local state
    }
    resetCsrf();
    set({ user: null, loading: false, error: null });
  },

  /**
   * Clear any stored error messages.
   */
  clearError: () => set({ error: null }),

  /**
   * Check if user has a specific permission.
   */
  can: (permission) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) ?? false;
  },

  /**
   * Check if user has a specific role.
   */
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    // Support both Spatie roles array and legacy role string
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return user.role === role;
  },
}));

export default useAuthStore;
