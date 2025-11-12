import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AuthActions } from './auth.actions';
import { AuthService } from '../../services/auth.service';
import { AuthUtils } from '../../modules/auth/services/auth.utils';
import { selectRedirectUrl } from './auth.selectors';

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  // Login effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password, redirectUrl }) =>
        this.authService.loginHttp(email, password).pipe(
          map((response) => {
            if (response?.access_token) {
              // Store auth data
              this.authService.setAuthFromLocalStorage(response);
              return AuthActions.loginSuccess({ response });
            } else {
              return AuthActions.loginFailure({ error: 'Invalid credentials' });
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Login failed';
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Login success navigation
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      withLatestFrom(this.store.select(selectRedirectUrl)),
      switchMap(([action, redirectUrl]) => {
        const response = action.response;
        
        // Load user after successful login
        return of(AuthActions.loadUser());
      })
    )
  );

  // Google authentication effect
  googleAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleAuth),
      switchMap(({ authModel, redirectUrl }) =>
        this.authService.googleAuthHttp(authModel).pipe(
          map((response) => {
            if (response?.access_token) {
              // Store auth data
              this.authService.setAuthFromLocalStorage(response);
              return AuthActions.googleAuthSuccess({ response });
            } else {
              return AuthActions.googleAuthFailure({ error: 'Google authentication failed' });
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Google authentication failed';
            return of(AuthActions.googleAuthFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Google auth success effect - load user
  googleAuthSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleAuthSuccess),
      map(() => AuthActions.loadUser())
    )
  );

  // Load user effect
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      switchMap(() =>
        this.authService.getUserByTokenHttp().pipe(
          map((user) => {
            if (user) {
              return AuthActions.loadUserSuccess({ user });
            } else {
              return AuthActions.loadUserFailure({ error: 'Failed to load user' });
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Failed to load user';
            return of(AuthActions.loadUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Load user success effect - handle navigation and modules
  loadUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserSuccess),
      withLatestFrom(this.store.select(selectRedirectUrl)),
      tap(([action, redirectUrl]) => {
        const user = action.user;
        
        // Store user modules if available
        if (user?.modules && user.modules.length > 0) {
          localStorage.setItem('recentModuleIDs', JSON.stringify(user.modules));
          localStorage.setItem('is_static', user.is_static?.toString() || 'false');
        }
        
        // Navigate to redirect URL or home if we have a redirect URL
        if (redirectUrl) {
          const navigationUrl = redirectUrl || '/';
          this.router.navigate([navigationUrl]);
          
          // Show success message
          this.authService.showSuccessMessage(`Welcome! ${user?.first_name}`);
        }
      }),
      map(() => AuthActions.clearRedirectUrl())
    )
  );

  // Registration effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ user }) =>
        this.authService.registrationHttp(user).pipe(
          switchMap((response) => {
            // After successful registration, attempt login
            return this.authService.loginHttp(user.email, user.password || '').pipe(
              map((loginResponse) => {
                if (loginResponse?.access_token) {
                  this.authService.setAuthFromLocalStorage(loginResponse);
                  return AuthActions.registerSuccess({ response: loginResponse });
                } else {
                  return AuthActions.registerFailure({ error: 'Registration successful but login failed' });
                }
              })
            );
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Registration failed';
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Logout effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(({ redirectUrl }) => {
        // Call the logout HTTP method which handles cleanup
        this.authService.logoutHttp();
        
        // Navigate after logout
        this.authService.navigateAfterLogout(redirectUrl);
      }),
      map(() => AuthActions.logoutSuccess()),
      catchError((error) => {
        const errorMessage = error?.error?.message || error?.message || 'Logout failed';
        return of(AuthActions.logoutFailure({ error: errorMessage }));
      })
    )
  );

  // Forgot password effect
  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      switchMap(({ email }) =>
        this.authService.forgotPasswordHttp(email).pipe(
          map((response) => {
            this.authService.showSuccessMessage('Password reset email sent successfully');
            return AuthActions.forgotPasswordSuccess({ message: 'Password reset email sent' });
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Failed to send password reset email';
            this.authService.showErrorMessage(errorMessage);
            return of(AuthActions.forgotPasswordFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Token validity check effect
  checkTokenValidity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkTokenValidity),
      switchMap(() => {
        // Get auth from localStorage
        const auth = this.authService.getAuthFromLocalStorage();
        
        if (!auth || !auth.access_token) {
          return of(AuthActions.tokenExpired());
        }

        // Check if token is expired
        if (AuthUtils.isTokenExpired(auth.access_token)) {
          return of(AuthActions.tokenExpired());
        }

        // Token is valid, load user
        return of(AuthActions.loadUser());
      })
    )
  );

  // Token expired effect
  tokenExpired$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tokenExpired),
      tap(() => {
        this.authService.showWarningMessage('Your session has expired. Please login again.');
        this.authService.logoutHttp();
        this.authService.navigateAfterLogout();
      })
    ), { dispatch: false }
  );

  // Initialize app effect
  initializeApp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeApp),
      switchMap(() => {
        // Check if user is authenticated on app startup
        return of(AuthActions.checkTokenValidity());
      })
    )
  );

  // Error effects for showing notifications
  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        this.authService.showErrorMessage(error);
      })
    ), { dispatch: false }
  );

  googleAuthFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleAuthFailure),
      tap(({ error }) => {
        this.authService.showErrorMessage(error);
      })
    ), { dispatch: false }
  );

  registerFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(({ error }) => {
        this.authService.showErrorMessage(error);
      })
    ), { dispatch: false }
  );

  loadUserFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFailure),
      tap(({ error }) => {
        console.error('Load user failed:', error);
        // Don't show notification for load user failure as it might be due to logout
      })
    ), { dispatch: false }
  );

  // Navigation effect
  navigateAfterAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.navigateAfterAuth),
      tap(({ url }) => {
        this.router.navigate([url]);
      })
    ), { dispatch: false }
  );
}