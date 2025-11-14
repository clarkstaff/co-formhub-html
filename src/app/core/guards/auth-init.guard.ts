import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, combineLatest } from 'rxjs';
import { filter, take, tap, switchMap, map } from 'rxjs/operators';

import { AuthActions } from '../store/auth/auth.actions';
import { AuthService } from '../services/auth.service';
import { selectIsCheckingAuth, selectCurrentUser, selectIsAuthenticated } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthInitGuard implements CanActivate, CanActivateChild {
  private initializationStarted = false;

  constructor(
    private store: Store,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.ensureAuthInitialized();
  }

  canActivateChild(): Observable<boolean> {
    return this.ensureAuthInitialized();
  }

  private ensureAuthInitialized(): Observable<boolean> {
    console.log('AuthInitGuard: Ensuring auth initialization');
    
    // Check localStorage directly for token
    const auth = this.authService.getAuthFromLocalStorage();
    console.log('AuthInitGuard: Token in localStorage:', auth ? 'exists' : 'missing');
    
    if (!auth || !auth.access_token) {
      // No token, no need to initialize
      console.log('AuthInitGuard: No token found, skipping initialization');
      return of(true);
    }

    // Token exists, check if we need to initialize store
    return combineLatest([
      this.store.select(selectIsCheckingAuth),
      this.store.select(selectCurrentUser)
    ]).pipe(
      tap(([isCheckingAuth, user]) => {
        // Initialize only if not already checking and no user data in store
        if (!isCheckingAuth && !user && !this.initializationStarted) {
          this.initializationStarted = true;
          console.log('AuthInitGuard: Initializing store with token validation');
          this.store.dispatch(AuthActions.checkTokenValidity());
        }
      }),
      filter(([isCheckingAuth]) => !isCheckingAuth), // Wait until not checking
      map(() => {
        console.log('AuthInitGuard: Initialization complete, allowing navigation');
        return true;
      }),
      take(1)
    );
  }
}