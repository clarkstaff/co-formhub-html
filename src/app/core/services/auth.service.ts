import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, tap, catchError, switchMap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { AuthUtils } from './auth.utils';
import Swal from 'sweetalert2';

// Import store related modules
import { AuthActions } from '../store/auth/auth.actions';
import { 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectIsLoggingIn, 
  selectIsLoading, 
  selectIsClickable,
  selectUserPermissions,
  selectAuthError,
  selectLoginError,
  selectIsImpersonating,
  selectRedirectUrl
} from '../store/auth/auth.selectors';

// import { SocialAuthService } from '@abacritt/angularx-social-login';

export interface UserModel {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  modules?: any[];
  permissions?: any[];
  is_static?: boolean;
  access_token?: string;
  expires_in?: string;
  password?: string;
}

export interface AuthModel {
  access_token: string;
  refresh_token?: string;
  expires_in?: string;
  user?: UserModel;
}

export interface AuthResponse {
  result?: string;
  message?: string;
  user?: UserModel;
  access_token?: string;
  expires_in?: string;
}

export type UserType = UserModel | undefined | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // Private fields
  private unsubscribe: Subscription[] = [];
  public authLocalStorageToken = `${environment.appVersion}-auth`;
  
  // Store observables - replacing BehaviorSubjects
  currentUser$: Observable<UserType>;
  isAuthenticated$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  isLoggingIn$: Observable<boolean>;
  _isClickable$: Observable<boolean>;
  permissions$: Observable<any[]>;
  error$: Observable<string | null>;
  loginError$: Observable<string | null>;
  isImpersonating$: Observable<boolean>;
  redirectUrl$: Observable<string | null>;

  // Legacy compatibility - deprecated, use store selectors instead
  private currentUserSubject: BehaviorSubject<UserType>;
  private isLoadingSubject: BehaviorSubject<boolean>;
  private _isClickable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentPermission = new BehaviorSubject<Array<any>>([]);
  isImpersonate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Getters for store selectors
  get _isClickable$Obs(): Observable<boolean> {
    return this.store.select(selectIsClickable);
  }

  get userPermission(): any {
    let permissions: any[] = [];
    this.permissions$.pipe(tap(perms => permissions = perms)).subscribe();
    return permissions;
  }

  get currentPermission$(): Observable<string[]> {
    return this.store.select(selectUserPermissions);
  }

  get currentUserValue(): UserType {
    let user: UserType = null;
    this.currentUser$.pipe(tap(u => user = u)).subscribe();
    return user;
  }

  set currentUserValue(user: UserType) {
    if (user) {
      this.store.dispatch(AuthActions.setUser({ user }));
    } else {
      this.store.dispatch(AuthActions.clearUser());
    }
  }

  get isImpersonateValue(): boolean {
    let isImpersonating = false;
    this.isImpersonating$.pipe(tap(imp => isImpersonating = imp)).subscribe();
    return isImpersonating;
  }

  set isImpersonateValue(isImpersonate: boolean) {
    // This will be handled by impersonation actions
    this.isImpersonate.next(isImpersonate);
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store,
    // private socialAuthService: SocialAuthService,
  ) {
    // Initialize store observables
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isLoggingIn$ = this.store.select(selectIsLoggingIn);
    this._isClickable$ = this.store.select(selectIsClickable);
    this.permissions$ = this.store.select(selectUserPermissions);
    this.error$ = this.store.select(selectAuthError);
    this.loginError$ = this.store.select(selectLoginError);
    this.isImpersonating$ = this.store.select(selectIsImpersonating);
    this.redirectUrl$ = this.store.select(selectRedirectUrl);

    // Legacy compatibility - keep for backward compatibility
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    
    // Sync legacy subjects with store
    this.isLoading$.subscribe(loading => this.isLoadingSubject.next(loading));
    this.currentUser$.subscribe(user => this.currentUserSubject.next(user));
    this._isClickable$.subscribe(clickable => this._isClickable.next(clickable));
    this.permissions$.subscribe(permissions => this.currentPermission.next(permissions));
    this.isImpersonating$.subscribe(impersonating => this.isImpersonate.next(impersonating));
  }

  // Login with email and password - now dispatches store actions
  login(email: string, password: string, redirectUrl?: string): Observable<any> {
    // Set redirect URL if provided
    if (redirectUrl) {
      this.store.dispatch(AuthActions.setRedirectUrl({ redirectUrl }));
    }
    
    // Dispatch login action
    this.store.dispatch(AuthActions.login({ email, password, redirectUrl }));
    
    // Return an observable that completes when login is done
    return new Observable(observer => {
      const subscription = this.isLoggingIn$.subscribe(isLoggingIn => {
        if (!isLoggingIn) {
          // Check if login was successful by checking if user exists
          this.currentUser$.pipe(
            tap(user => {
              if (user) {
                observer.next({ access_token: 'success', user });
              } else {
                // Check for error
                this.loginError$.pipe(
                  tap(error => {
                    if (error) {
                      observer.next({ result: '403', message: error });
                    }
                  })
                ).subscribe();
              }
              observer.complete();
              subscription.unsubscribe();
            })
          ).subscribe();
        }
      });
    });
  }

  // Google authentication - now dispatches store actions
  googleAuth(authModel: any, redirectUrl?: string): Observable<any> {
    // Set redirect URL if provided
    if (redirectUrl) {
      this.store.dispatch(AuthActions.setRedirectUrl({ redirectUrl }));
    }
    
    // Dispatch google auth action
    this.store.dispatch(AuthActions.googleAuth({ authModel, redirectUrl }));
    
    // Return an observable that completes when auth is done
    return new Observable(observer => {
      const subscription = this.isLoggingIn$.subscribe(isLoggingIn => {
        if (!isLoggingIn) {
          // Check if auth was successful by checking if user exists
          this.currentUser$.pipe(
            tap(user => {
              if (user) {
                observer.next({ access_token: 'success', user });
              } else {
                // Check for error
                this.loginError$.pipe(
                  tap(error => {
                    if (error) {
                      observer.next({ result: '403', message: error });
                    }
                  })
                ).subscribe();
              }
              observer.complete();
              subscription.unsubscribe();
            })
          ).subscribe();
        }
      });
    });
  }

  // Get user by token - now dispatches store actions
  getUserByToken(): Observable<UserType> {
    this.store.dispatch(AuthActions.loadUser());
    return this.currentUser$;
  }

  // Logout - now dispatches store actions
  logout(redirectUrl?: string): void {
    this.store.dispatch(AuthActions.logout({ redirectUrl }));
  }

  // Registration - now dispatches store actions
  registration(user: UserModel): Observable<any> {
    this.store.dispatch(AuthActions.register({ user }));
    
    // Return an observable that completes when registration is done
    return new Observable(observer => {
      const subscription = this.isLoading$.subscribe(isLoading => {
        if (!isLoading) {
          this.currentUser$.pipe(
            tap(currentUser => {
              if (currentUser) {
                observer.next({ access_token: 'success', user: currentUser });
              } else {
                this.error$.pipe(
                  tap(error => {
                    if (error) {
                      observer.next({ error });
                    }
                  })
                ).subscribe();
              }
              observer.complete();
              subscription.unsubscribe();
            })
          ).subscribe();
        }
      });
    });
  }

  // Forgot password - now dispatches store actions
  forgotPassword(email: string): Observable<any> {
    this.store.dispatch(AuthActions.forgotPassword({ email }));
    
    return new Observable(observer => {
      const subscription = this.isLoading$.subscribe(isLoading => {
        if (!isLoading) {
          observer.next({ success: true });
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    let isAuth = false;
    this.isAuthenticated$.pipe(tap(auth => isAuth = auth)).subscribe();
    return isAuth;
  }

  // Initialize app - dispatch action to check auth on app startup
  initializeApp(): void {
    this.store.dispatch(AuthActions.initializeApp());
  }

  // Internal HTTP methods - used by effects, don't call directly from components
  loginHttp(email: string, password: string): Observable<AuthModel> {
    const loginData = { email, password };
    return this.http.post<AuthModel>(`${environment.portal.url}/auth/login`, loginData);
  }

  googleAuthHttp(authModel: any): Observable<AuthModel> {
    const googleData = {
      id_token: authModel.idToken,
      email: authModel.email,
      name: authModel.name,
      photo: authModel.photoUrl
    };
    return this.http.post<AuthModel>(`${environment.portal.url}/auth/google`, googleData);
  }

  getUserByTokenHttp(): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.portal.url}/auth/me`);
  }

  registrationHttp(user: UserModel): Observable<any> {
    return this.http.post<UserModel>(`${environment.portal.url}/auth/register`, user);
  }

  forgotPasswordHttp(email: string): Observable<any> {
    return this.http.post(`${environment.portal.url}/auth/forgot-password`, { email });
  }

  logoutHttp(): void {
    // Cleanup localStorage and navigate
    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.removeItem(this.authLocalStorageToken + '_current');
    localStorage.removeItem('recentModuleIDs');
    localStorage.removeItem('is_static');
    
    // this.socialAuthService.signOut(true);
  }

  navigateAfterLogout(redirectUrl?: string): void {
    if (redirectUrl && redirectUrl !== '') {
      this.router.navigate(['/auth/boxed-signin'], {
        queryParams: { redirectUrl }
      });
    } else {
      this.router.navigate(['/auth/boxed-signin']);
    }
  }
  // Storage helpers
  setAuthFromLocalStorage(auth: AuthModel): boolean {
    if (auth && auth.access_token) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }
      return JSON.parse(lsValue);
    } catch (error) {
      return undefined;
    }
  }

  // Notification methods using SweetAlert2
  showSuccessMessage(msg: string = 'Operation successful', duration: number = 3000) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: 'color-success',
      },
    });
    toast.fire({
      title: msg,
    });
  }

  showErrorMessage(msg: string = 'An error occurred', duration: number = 3000) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: 'color-danger',
      },
    });
    toast.fire({
      title: msg,
    });
  }

  showWarningMessage(msg: string = 'Warning', duration: number = 3000) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: 'color-warning',
      },
    });
    toast.fire({
      title: msg,
    });
  }

  showInfoMessage(msg: string = 'Information', duration: number = 3000) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: 'color-info',
      },
    });
    toast.fire({
      title: msg,
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}