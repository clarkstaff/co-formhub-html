import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserModel } from '../../services/auth.service';
import { 
  LoginRequest, 
  GoogleAuthRequest, 
  RegistrationRequest, 
  AuthServerResponse 
} from './auth.state';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login actions
    'Login': props<LoginRequest>(),
    'Login Success': props<{ response: AuthServerResponse }>(),
    'Login Failure': props<{ error: string }>(),
    
    // Google auth actions
    'Google Auth': props<GoogleAuthRequest>(),
    'Google Auth Success': props<{ response: AuthServerResponse }>(),
    'Google Auth Failure': props<{ error: string }>(),
    
    // Registration actions
    'Register': props<RegistrationRequest>(),
    'Register Success': props<{ response: AuthServerResponse }>(),
    'Register Failure': props<{ error: string }>(),
    
    // User actions
    'Load User': emptyProps(),
    'Load User Success': props<{ user: UserModel }>(),
    'Load User Failure': props<{ error: string }>(),
    'Set User': props<{ user: UserModel }>(),
    'Clear User': emptyProps(),
    
    // Logout actions
    'Logout': props<{ redirectUrl?: string }>(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),
    
    // Token actions
    'Check Token Validity': emptyProps(),
    'Token Expired': emptyProps(),
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ response: AuthServerResponse }>(),
    'Refresh Token Failure': props<{ error: string }>(),
    
    // Impersonation actions
    'Start Impersonation': props<{ userId: number }>(),
    'Start Impersonation Success': props<{ 
      impersonatedUser: UserModel; 
      originalUser: UserModel 
    }>(),
    'Start Impersonation Failure': props<{ error: string }>(),
    'Exit Impersonation': emptyProps(),
    'Exit Impersonation Success': props<{ originalUser: UserModel }>(),
    'Exit Impersonation Failure': props<{ error: string }>(),
    
    // Permission actions
    'Set Permissions': props<{ permissions: any[] }>(),
    'Clear Permissions': emptyProps(),
    
    // UI state actions
    'Set Loading': props<{ loading: boolean }>(),
    'Set Logging In': props<{ loggingIn: boolean }>(),
    'Set Logging Out': props<{ loggingOut: boolean }>(),
    'Set Checking Auth': props<{ checkingAuth: boolean }>(),
    'Set Clickable': props<{ clickable: boolean }>(),
    
    // Error actions
    'Clear Error': emptyProps(),
    'Clear Login Error': emptyProps(),
    'Set Error': props<{ error: string }>(),
    'Set Login Error': props<{ error: string }>(),
    
    // Navigation actions
    'Set Redirect Url': props<{ redirectUrl: string }>(),
    'Clear Redirect Url': emptyProps(),
    'Navigate After Auth': props<{ url: string }>(),
    
    // Forgot password actions
    'Forgot Password': props<{ email: string }>(),
    'Forgot Password Success': props<{ message: string }>(),
    'Forgot Password Failure': props<{ error: string }>(),
    
    // Change password actions
    'Change Password': props<{ 
      newPassword: string; 
      newPasswordConfirmation: string 
    }>(),
    'Change Password Success': props<{ message: string }>(),
    'Change Password Failure': props<{ error: string }>(),
    
    // Initialize app
    'Initialize App': emptyProps(),
    'Initialize App Success': emptyProps(),
    'Initialize App Failure': props<{ error: string }>(),
  }
});

// Export individual action types for easier usage
export const {
  login,
  loginSuccess,
  loginFailure,
  googleAuth,
  googleAuthSuccess,
  googleAuthFailure,
  register,
  registerSuccess,
  registerFailure,
  loadUser,
  loadUserSuccess,
  loadUserFailure,
  setUser,
  clearUser,
  logout,
  logoutSuccess,
  logoutFailure,
  checkTokenValidity,
  tokenExpired,
  refreshToken,
  refreshTokenSuccess,
  refreshTokenFailure,
  startImpersonation,
  startImpersonationSuccess,
  startImpersonationFailure,
  exitImpersonation,
  exitImpersonationSuccess,
  exitImpersonationFailure,
  setPermissions,
  clearPermissions,
  setLoading,
  setLoggingIn,
  setLoggingOut,
  setCheckingAuth,
  setClickable,
  clearError,
  clearLoginError,
  setError,
  setLoginError,
  setRedirectUrl,
  clearRedirectUrl,
  navigateAfterAuth,
  forgotPassword,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  changePassword,
  changePasswordSuccess,
  changePasswordFailure,
  initializeApp,
  initializeAppSuccess,
  initializeAppFailure,
} = AuthActions;