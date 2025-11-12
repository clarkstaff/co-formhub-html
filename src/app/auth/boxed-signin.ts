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
    
    // Loading and error states
    hasError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    hasError$: Observable<boolean>;
    responseMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    responseMessage$: Observable<string>;
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isLoading$: Observable<boolean>;
    isClickable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    isClickable$: Observable<boolean>;
    
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
        this.hasError$ = this.hasError.asObservable();
        this.responseMessage$ = this.responseMessage.asObservable();
        this.isLoading$ = this.isLoading.asObservable();
        this.isClickable$ = this.isClickable.asObservable();
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

        this.isLoading.next(true);
        this.isClickable.next(false);
        this.hasError.next(false);
        this.responseMessage.next('');

        const { email, password } = this.loginForm.value;

        const loginSubscr = this.authService
            .login(email, password, this.returnUrl)
            .pipe(first())
            .subscribe({
                next: (response: any) => {
                    this.isLoading.next(false);
                    this.isClickable.next(true);
                    
                    if (response?.result === '403' || response?.result === '404') {
                        this.hasError.next(true);
                        this.responseMessage.next(response.message);
                        this.authService.showErrorMessage(response.message);
                    } else if (response?.access_token) {
                        // Handle successful login - AuthService already handles navigation and success message
                        if (response?.user?.modules && response.user.modules.length > 0) {
                            localStorage.setItem('recentModuleIDs', JSON.stringify(response.user.modules));
                            localStorage.setItem('is_static', response.user.is_static.toString());
                        }
                    }
                },
                error: (error) => {
                    this.isLoading.next(false);
                    this.isClickable.next(true);
                    this.hasError.next(true);
                    
                    let errorMessage = 'Cannot process your request';
                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (error?.error?.message) {
                        errorMessage = error.error.message;
                    }
                    
                    this.responseMessage.next(errorMessage);
                    this.authService.showErrorMessage('Login failed. Please try again.');
                }
            });
        this.unsubscribe.push(loginSubscr);
    }

    // Google Sign-In handler
    handleGoogleSignIn() {
        // TODO: Implement Google sign-in
        this.isLoading.next(true);
        this.authService.showInfoMessage('Google sign-in will be available soon');
        this.isLoading.next(false);
        /*
        this.isLoading.next(true);
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
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
        this.authService.getUserByToken().subscribe(user => {
            if (user) {
                this.router.navigate([this.returnUrl]);
            }
        });
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
