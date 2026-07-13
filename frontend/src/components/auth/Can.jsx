import useAuthStore from '../../stores/authStore';

/**
 * Permission-based Conditional Rendering Component
 * 
 * Renders its children only if the authenticated user has the required permission
 * or is a super admin. Otherwise, renders the fallback (or nothing).
 * 
 * Usage:
 * <Can perform="create-campaigns" fallback={<p>Not authorized</p>}>
 *   <button>Create Campaign</button>
 * </Can>
 */
export function Can({ perform, children, fallback = null }) {
  const { user, can } = useAuthStore();

  if (!user) {
    return fallback;
  }

  // Super admin skips all permission checks
  if (user.role === 'super_admin' || user.roles?.includes('super_admin')) {
    return children;
  }

  // If perform is a function, call it with user state
  if (typeof perform === 'function') {
    return perform(user) ? children : fallback;
  }

  // Support array of permissions (ALL must be present)
  if (Array.isArray(perform)) {
    const hasAll = perform.every(p => can(p));
    return hasAll ? children : fallback;
  }

  // Single permission string
  return can(perform) ? children : fallback;
}

export default Can;
