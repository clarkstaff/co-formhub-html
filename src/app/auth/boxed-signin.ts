import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toggleAnimation } from 'src/app/shared/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/services/toast.service';
import { AuthActions } from 'src/app/core/store/auth/auth.actions';
import { 
  selectIsLoggingIn, 
  selectLoginError, 
  selectIsAuthenticated,
  selectCurrentUser 
} from 'src/app/core/store/auth/auth.selectors';
// Note: For Google auth, you'll need to install @abacritt/angularx-social-login
// import { SocialAuthService, GoogleLoginProvider } from "@abacritt/angularx-social-login";

@Component({
    templateUrl: './boxed-signin.html',
    animations: [toggleAnimation],
})
export class BoxedSigninComponent implements OnInit, OnDestroy {
    store: any;
    loginForm!: FormGroup;
    returnUrl: string = '';
    
    // Store observables
    isLoggingIn$: Observable<boolean>;
    loginError$: Observable<string | null>;
    isAuthenticated$: Observable<boolean>;
    currentUser$: Observable<any>;
    
    // UI state
    viewPassword: boolean = false;
    isCaps: boolean = false;
    
    private unsubscribe: Subscription[] = [];

    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
        private appSetting: AppService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private authService: AuthService,
        private toastService: ToastService,
        // private socialAuthService: SocialAuthService, // For Google auth
    ) {
        this.initStore();
        
        // Initialize store observables
        this.isLoggingIn$ = this.storeData.select(selectIsLoggingIn);
        this.loginError$ = this.storeData.select(selectLoginError);
        this.isAuthenticated$ = this.storeData.select(selectIsAuthenticated);
        this.currentUser$ = this.storeData.select(selectCurrentUser);
    }

    ngOnInit(): void {
        this.initForm();
        this.returnUrl = this.route.snapshot.queryParams['redirectUrl'] || '/';
        
        // Check if user is already authenticated
        this.checkExistingAuth();
        
        // Setup Google auth listener (uncomment when Google auth is configured)
        // this.setupGoogleAuthListener();
    }

    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    initForm() {
        this.loginForm = this.fb.group({
            email: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.email,
                    Validators.minLength(8),
                    Validators.maxLength(320),
                ]),
            ],
            password: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(100),
                ]),
            ],
        });
    }

    get control() {
        return this.loginForm.controls;
    }

    // Handle keyboard events for caps lock detection
    @HostListener('window:keydown', ['$event'])
    public onKeydown(event: KeyboardEvent): void {
        this.isCaps = typeof event.getModifierState === 'function' && event.getModifierState('CapsLock');
    }

    // Handle form submission
    @HostListener('window:keyup', ['$event'])
    public onKeyup(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.loginForm.valid) {
            this.submit();
        }
    }

    toggleViewPassword() {
        this.viewPassword = !this.viewPassword;
    }

    submit() {
        if (!this.loginForm.valid) {
            this.markFormGroupTouched();
            return;
        }

        const { email, password } = this.loginForm.value;
        
        // Ensure we have a proper redirect URL - avoid redirecting back to login page
        let redirectUrl = this.returnUrl;
        
        // If returnUrl is empty, login page, or auth-related, default to root
        if (!redirectUrl || 
            redirectUrl === '' || 
            redirectUrl === '/auth/boxed-signin' || 
            redirectUrl.includes('/auth/') ||
            redirectUrl === '/login') {
            redirectUrl = '/';
        }
        
        // Set redirect URL in store
        this.storeData.dispatch(AuthActions.setRedirectUrl({ redirectUrl }));

        // Dispatch login action - the effects will handle the API call and navigation
        this.storeData.dispatch(AuthActions.login({ 
            email, 
            password, 
            redirectUrl 
        }));
    }

    // Google Sign-In handler
    handleGoogleSignIn() {
        // TODO: Implement Google sign-in with NgRx store
        this.authService.showInfoMessage('Google sign-in will be available soon');
        /*
        // When Google auth is implemented, use this:
        // this.storeData.dispatch(AuthActions.googleAuth({ authModel: googleUser, redirectUrl: this.returnUrl }));
        */
    }

    // Mark all form fields as touched to show validation errors
    private markFormGroupTouched() {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    // Check if user is already authenticated
    private checkExistingAuth() {
        // Subscribe to auth state changes
        const authSub = this.isAuthenticated$.subscribe(isAuthenticated => {
            if (isAuthenticated) {
                // If user is already authenticated and trying to access login page,
                // redirect to root instead of the returnUrl (which might be the login page itself)
                const redirectUrl = this.returnUrl && 
                                  this.returnUrl !== '/auth/boxed-signin' && 
                                  !this.returnUrl.includes('/auth/') && 
                                  this.returnUrl !== '/login' && 
                                  this.returnUrl !== '' 
                    ? this.returnUrl 
                    : '/';
                    
                console.log('User already authenticated, redirecting to:', redirectUrl);
                this.router.navigate([redirectUrl]);
            }
        });
        this.unsubscribe.push(authSub);
    }

    // Setup Google authentication listener
    private setupGoogleAuthListener() {
        // TODO: Implement Google auth listener
        /*
        const googleSub = this.socialAuthService.authState.subscribe((user) => {
            if (user) {
                const gauthSubscribe = this.authService.googleAuth(user, this.returnUrl)
                    .subscribe({
                        next: (response) => {
                            if (response?.result === '403' || response?.result === '404') {
                                this.hasError.next(true);
                                this.responseMessage.next(response.message);
                                this.toastService.danger(response.message);
                            }
                            googleSub.unsubscribe();
                        },
                        error: (error) => {
                            this.toastService.danger('Unable to sign you in');
                        }
                    });
                this.unsubscribe.push(gauthSubscribe);
            } else {
                this.toastService.danger('Logged-out');
            }
        });
        this.unsubscribe.push(googleSub);
        */
    }

    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }

    // Helper methods for template
    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.loginForm.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['email']) return 'Please enter a valid email';
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
        }
        return '';
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
