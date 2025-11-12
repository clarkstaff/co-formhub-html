import { UserModel } from '../../services/auth.service';

export interface AuthState {
  // User data
  user: UserModel | null;
  isAuthenticated: boolean;
  
  // Loading states
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isCheckingAuth: boolean;
  
  // UI states
  isClickable: boolean;
  
  // Permissions and roles
  permissions: any[];
  
  // Impersonation
  isImpersonating: boolean;
  originalUser: UserModel | null;
  
  // Error handling
  error: string | null;
  loginError: string | null;
  
  // Token info
  tokenExpiry: number | null;
  
  // Navigation
  redirectUrl: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isCheckingAuth: false,
  isClickable: true,
  permissions: [],
  isImpersonating: false,
  originalUser: null,
  error: null,
  loginError: null,
  tokenExpiry: null,
  redirectUrl: null
};

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
  redirectUrl?: string;
}

// Google auth request interface
export interface GoogleAuthRequest {
  authModel: any;
  redirectUrl?: string;
}

// Registration request interface
export interface RegistrationRequest {
  user: UserModel;
}

// Auth response from server
export interface AuthServerResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: string;
  user?: UserModel;
  result?: string;
  message?: string;
}