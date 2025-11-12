import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { AuthUtils } from '../services/auth.utils';
import { AuthActions } from '../store/auth/auth.actions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor
   */
  env = environment;
  
  constructor(
    private store: Store,
    private authService: AuthService
  ) {}

  /**
   * Intercept
   *
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request object
    let newReq = req.clone();
    
    // Get auth data from AuthService instead of directly from localStorage
    const auth = this.authService.getAuthFromLocalStorage();
    let bearerToken = auth?.access_token || '';

    // Check if the request URL is for the asset API
    if (req.url.startsWith(this.env.asset.url)) {
      bearerToken = environment.asset.token;
    }

    // Check token expiration before making the request
    if (auth && auth.access_token) {
      if (AuthUtils.isTokenExpired(auth.access_token)) {
        // Dispatch token expired action to handle cleanup via store
        this.store.dispatch(AuthActions.tokenExpired());
        return throwError(() => new Error('Access token expired'));
      }

      // Add authorization header if token is valid
      newReq = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + bearerToken,
        },
      });
    }

    // Handle response
    return next.handle(newReq).pipe(
      catchError((error) => {
        // Catch "401 Unauthorized" responses
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Dispatch logout action to handle cleanup via store
          this.store.dispatch(AuthActions.logout({}));
          
          // Show error message
          this.authService.showWarningMessage('Your session has expired. Please login again.');
        }
        
        return throwError(() => error);
      })
    );
  }
}
