import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

// Feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// User selectors
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectUserPermissions = createSelector(
  selectAuthState,
  (state: AuthState) => state.permissions
);

export const selectUserId = createSelector(
  selectCurrentUser,
  (user) => user?.id
);

export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email
);

export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.first_name} ${user.last_name}` : null
);

export const selectUserFirstName = createSelector(
  selectCurrentUser,
  (user) => user?.first_name
);

export const selectUserLastName = createSelector(
  selectCurrentUser,
  (user) => user?.last_name
);

export const selectUserModules = createSelector(
  selectCurrentUser,
  (user) => user?.modules || []
);

// Loading state selectors
export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectIsLoggingIn = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoggingIn
);

export const selectIsLoggingOut = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoggingOut
);

export const selectIsCheckingAuth = createSelector(
  selectAuthState,
  (state: AuthState) => state.isCheckingAuth
);

export const selectIsClickable = createSelector(
  selectAuthState,
  (state: AuthState) => state.isClickable
);

// Combined loading selector
export const selectIsAnyLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading || state.isLoggingIn || state.isLoggingOut || state.isCheckingAuth
);

// Error selectors
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectLoginError = createSelector(
  selectAuthState,
  (state: AuthState) => state.loginError
);

export const selectHasError = createSelector(
  selectAuthState,
  (state: AuthState) => !!(state.error || state.loginError)
);

// Impersonation selectors
export const selectIsImpersonating = createSelector(
  selectAuthState,
  (state: AuthState) => state.isImpersonating
);

export const selectOriginalUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.originalUser
);

export const selectImpersonationInfo = createSelector(
  selectAuthState,
  (state: AuthState) => ({
    isImpersonating: state.isImpersonating,
    currentUser: state.user,
    originalUser: state.originalUser
  })
);

// Navigation selectors
export const selectRedirectUrl = createSelector(
  selectAuthState,
  (state: AuthState) => state.redirectUrl
);

// Token selectors
export const selectTokenExpiry = createSelector(
  selectAuthState,
  (state: AuthState) => state.tokenExpiry
);

export const selectIsTokenExpired = createSelector(
  selectTokenExpiry,
  (expiry) => {
    if (!expiry) return true;
    return Date.now() / 1000 > expiry;
  }
);

// Permission utility selectors
export const selectHasPermission = (permission: string) => createSelector(
  selectUserPermissions,
  (permissions) => permissions?.includes(permission) || false
);

export const selectHasAnyPermission = (permissionList: string[]) => createSelector(
  selectUserPermissions,
  (permissions) => permissionList.some(permission => permissions?.includes(permission)) || false
);

export const selectHasAllPermissions = (permissionList: string[]) => createSelector(
  selectUserPermissions,
  (permissions) => permissionList.every(permission => permissions?.includes(permission)) || false
);

// User role selectors (if you use role-based permissions)
export const selectUserRoles = createSelector(
  selectUserPermissions,
  (permissions) => {
    // Extract roles from permissions if they follow a pattern like 'role:admin', 'role:user', etc.
    return permissions?.filter(permission => permission.startsWith('role:'))
                     .map(permission => permission.replace('role:', '')) || [];
  }
);

export const selectHasRole = (role: string) => createSelector(
  selectUserRoles,
  (roles) => roles.includes(role)
);

// Combined auth status selector
export const selectAuthStatus = createSelector(
  selectAuthState,
  (state: AuthState) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isLoggingIn: state.isLoggingIn,
    isLoggingOut: state.isLoggingOut,
    isCheckingAuth: state.isCheckingAuth,
    hasError: !!(state.error || state.loginError),
    error: state.error || state.loginError,
    user: state.user,
    permissions: state.permissions
  })
);

// UI state selectors
export const selectUIState = createSelector(
  selectAuthState,
  (state: AuthState) => ({
    isClickable: state.isClickable,
    isLoading: state.isLoading,
    isLoggingIn: state.isLoggingIn,
    isLoggingOut: state.isLoggingOut,
    isCheckingAuth: state.isCheckingAuth,
    error: state.error,
    loginError: state.loginError
  })
);

// Dashboard readiness selector
export const selectIsDashboardReady = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated && !state.isCheckingAuth && !state.isLoading && !!state.user
);