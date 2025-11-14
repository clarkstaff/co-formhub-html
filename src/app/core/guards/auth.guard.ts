import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, combineLatest } from 'rxjs';
import { map, filter, take, switchMap, tap } from 'rxjs/operators';

import { AuthActions } from '../store/auth/auth.actions';
import { AuthService } from '../services/auth.service';
import { AuthUtils } from '../services/auth.utils';
import { 
  selectIsAuthenticated, 
  selectIsCheckingAuth, 
  selectCurrentUser,
  selectIsDashboardReady 
} from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private store: Store,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.checkAuthState();
  }

  canActivateChild(): Observable<boolean> {
    return this.checkAuthState();
  }

  private checkAuthState(): Observable<boolean> {
    // First check localStorage directly - don't rely on store state that gets reset on refresh
    const auth = this.authService.getAuthFromLocalStorage();
    
    console.log('AuthGuard: Checking auth state');
    console.log('AuthGuard: Token from localStorage:', auth ? 'exists' : 'missing');
    
    if (auth && auth.access_token && !AuthUtils.isTokenExpired(auth.access_token)) {
      console.log('AuthGuard: Valid token found, allowing access');
      
      // Token is valid, ensure user data is loaded in store if not already
      return combineLatest([
        this.store.select(selectCurrentUser),
        this.store.select(selectIsCheckingAuth)
      ]).pipe(
        tap(([user, isCheckingAuth]) => {
          // If no user in store but valid token, load user
          if (!user && !isCheckingAuth) {
            console.log('AuthGuard: Loading user data into store');
            this.store.dispatch(AuthActions.loadUser());
          }
        }),
        map(() => true), // Allow access immediately since token is valid
        take(1)
      );
    } else {
      console.log('AuthGuard: No valid token, redirecting to login');
      
      // No valid token, redirect to login with current URL
      const currentUrl = this.router.url;
      console.log('AuthGuard: Storing redirect URL:', currentUrl);
      
      // Set redirect URL in store
      this.store.dispatch(AuthActions.setRedirectUrl({ redirectUrl: currentUrl }));
      
      // Redirect to login
      this.router.navigate(['/auth/boxed-signin'], { 
        queryParams: { redirectUrl: currentUrl } 
      });
      
      return of(false);
    }
  }
}