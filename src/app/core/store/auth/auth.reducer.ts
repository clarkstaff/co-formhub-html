import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import { AuthActions } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  
  // Login reducers
  on(AuthActions.login, (state, { email, password, redirectUrl }) => ({
    ...state,
    isLoggingIn: true,
    isClickable: false,
    loginError: null,
    error: null,
    redirectUrl: redirectUrl || null
  })),
  
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user || null,
    isAuthenticated: !!(response.user && response.access_token),
    isLoggingIn: false,
    isClickable: true,
    loginError: null,
    error: null,
    permissions: response.user?.permissions || [],
    tokenExpiry: response.expires_in ? parseInt(response.expires_in) : null
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoggingIn: false,
    isClickable: true,
    loginError: error,
    error: error,
    isAuthenticated: false,
    user: null
  })),
  
  // Google auth reducers
  on(AuthActions.googleAuth, (state, { authModel, redirectUrl }) => ({
    ...state,
    isLoggingIn: true,
    isClickable: false,
    loginError: null,
    error: null,
    redirectUrl: redirectUrl || null
  })),
  
  on(AuthActions.googleAuthSuccess, (state, { response }) => ({
    ...state,
    user: response.user || null,
    isAuthenticated: !!(response.user && response.access_token),
    isLoggingIn: false,
    isClickable: true,
    loginError: null,
    error: null,
    permissions: response.user?.permissions || [],
    tokenExpiry: response.expires_in ? parseInt(response.expires_in) : null
  })),
  
  on(AuthActions.googleAuthFailure, (state, { error }) => ({
    ...state,
    isLoggingIn: false,
    isClickable: true,
    loginError: error,
    error: error,
    isAuthenticated: false,
    user: null
  })),
  
  // Registration reducers
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    isClickable: false,
    error: null
  })),
  
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user || null,
    isAuthenticated: !!(response.user && response.access_token),
    isLoading: false,
    isClickable: true,
    error: null,
    permissions: response.user?.permissions || [],
    tokenExpiry: response.expires_in ? parseInt(response.expires_in) : null
  })),
  
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isClickable: true,
    error: error,
    isAuthenticated: false,
    user: null
  })),
  
  // User reducers
  on(AuthActions.loadUser, (state) => ({
    ...state,
    isCheckingAuth: true,
    error: null
  })),
  
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user: user,
    isAuthenticated: true,
    isCheckingAuth: false,
    error: null,
    permissions: user.permissions || []
  })),
  
  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    isCheckingAuth: false,
    isAuthenticated: false,
    user: null,
    error: error,
    permissions: []
  })),
  
  on(AuthActions.setUser, (state, { user }) => ({
    ...state,
    user: user,
    isAuthenticated: true,
    permissions: user.permissions || []
  })),
  
  on(AuthActions.clearUser, (state) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    permissions: [],
    isImpersonating: false,
    originalUser: null
  })),
  
  // Logout reducers
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoggingOut: true,
    error: null
  })),
  
  on(AuthActions.logoutSuccess, (state) => ({
    ...initialAuthState,
    isLoggingOut: false
  })),
  
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoggingOut: false,
    error: error
  })),
  
  // Token reducers
  on(AuthActions.checkTokenValidity, (state) => ({
    ...state,
    isCheckingAuth: true
  })),
  
  on(AuthActions.tokenExpired, (state) => ({
    ...initialAuthState,
    error: 'Session expired. Please login again.'
  })),
  
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    isLoading: false,
    tokenExpiry: response.expires_in ? parseInt(response.expires_in) : null,
    error: null
  })),
  
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...initialAuthState,
    error: error
  })),
  
  // Impersonation reducers
  on(AuthActions.startImpersonation, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.startImpersonationSuccess, (state, { impersonatedUser, originalUser }) => ({
    ...state,
    user: impersonatedUser,
    originalUser: originalUser,
    isImpersonating: true,
    isLoading: false,
    permissions: impersonatedUser.permissions || [],
    error: null
  })),
  
  on(AuthActions.startImpersonationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error
  })),
  
  on(AuthActions.exitImpersonation, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.exitImpersonationSuccess, (state, { originalUser }) => ({
    ...state,
    user: originalUser,
    originalUser: null,
    isImpersonating: false,
    isLoading: false,
    permissions: originalUser.permissions || [],
    error: null
  })),
  
  on(AuthActions.exitImpersonationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error
  })),
  
  // Permission reducers
  on(AuthActions.setPermissions, (state, { permissions }) => ({
    ...state,
    permissions: permissions
  })),
  
  on(AuthActions.clearPermissions, (state) => ({
    ...state,
    permissions: []
  })),
  
  // UI state reducers
  on(AuthActions.setLoading, (state, { loading }) => ({
    ...state,
    isLoading: loading
  })),
  
  on(AuthActions.setLoggingIn, (state, { loggingIn }) => ({
    ...state,
    isLoggingIn: loggingIn
  })),
  
  on(AuthActions.setLoggingOut, (state, { loggingOut }) => ({
    ...state,
    isLoggingOut: loggingOut
  })),
  
  on(AuthActions.setCheckingAuth, (state, { checkingAuth }) => ({
    ...state,
    isCheckingAuth: checkingAuth
  })),
  
  on(AuthActions.setClickable, (state, { clickable }) => ({
    ...state,
    isClickable: clickable
  })),
  
  // Error reducers
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  })),
  
  on(AuthActions.clearLoginError, (state) => ({
    ...state,
    loginError: null
  })),
  
  on(AuthActions.setError, (state, { error }) => ({
    ...state,
    error: error
  })),
  
  on(AuthActions.setLoginError, (state, { error }) => ({
    ...state,
    loginError: error
  })),
  
  // Navigation reducers
  on(AuthActions.setRedirectUrl, (state, { redirectUrl }) => ({
    ...state,
    redirectUrl: redirectUrl
  })),
  
  on(AuthActions.clearRedirectUrl, (state) => ({
    ...state,
    redirectUrl: null
  })),
  
  // Forgot password reducers
  on(AuthActions.forgotPassword, (state) => ({
    ...state,
    isLoading: true,
    isClickable: false,
    error: null
  })),
  
  on(AuthActions.forgotPasswordSuccess, (state, { message }) => ({
    ...state,
    isLoading: false,
    isClickable: true,
    error: null
  })),
  
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isClickable: true,
    error: error
  })),
  
  // Change password reducers
  on(AuthActions.changePassword, (state) => ({
    ...state,
    isLoading: true,
    isClickable: false,
    error: null
  })),
  
  on(AuthActions.changePasswordSuccess, (state, { message }) => ({
    ...state,
    isLoading: false,
    isClickable: true,
    error: null
  })),
  
  on(AuthActions.changePasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isClickable: true,
    error: error
  })),
  
  // App initialization reducers
  on(AuthActions.initializeApp, (state) => ({
    ...state,
    isCheckingAuth: true,
    isLoading: true
  })),
  
  on(AuthActions.initializeAppSuccess, (state) => ({
    ...state,
    isCheckingAuth: false,
    isLoading: false
  })),
  
  on(AuthActions.initializeAppFailure, (state, { error }) => ({
    ...state,
    isCheckingAuth: false,
    isLoading: false,
    error: error
  }))
);