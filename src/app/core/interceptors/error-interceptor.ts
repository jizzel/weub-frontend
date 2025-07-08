import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ErrorHandler} from '../services/error-handler';
import {retry, catchError} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {environment} from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandler);
  return next(req).pipe(
    retry({
      count: environment.polling.maxRetries,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (!evaluateRetryCondition(error, retryCount)) {
          return throwError(() => error);
        }
        const delay = computeRetryDelay(retryCount);
        if (!environment.production) {
          console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${environment.polling.maxRetries})`);
        }
        return timer(delay);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      return errorHandler.handleHttpError(error);
    })
  );
};

function evaluateRetryCondition(error: HttpErrorResponse, retryCount: number): boolean {
  if (retryCount >= environment.polling.maxRetries) {
    return false;
  }

  if (error.status >= 400 && error.status < 500) {
    const retryableClientErrors = [408, 429]; // Timeout or Too Many Requests
    return retryableClientErrors.includes(error.status);
  }

  return error.status >= 500 || error.status === 0;


}

function computeRetryDelay(retryCount: number): number {
  const baseDelay = environment.polling.baseDelay || 1000;
  const maxDelay = environment.polling.maxDelay || 30000;

  const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  const jitter = Math.random() * 0.1 * exponentialDelay;

  return Math.round(exponentialDelay + jitter);
}
