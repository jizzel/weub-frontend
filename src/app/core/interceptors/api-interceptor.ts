import { HttpInterceptorFn } from '@angular/common/http';
import {environment} from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request to add the API base URL
  let apiReq = req;

  // Add base URL if not already present
  if (!req.url.startsWith('http')) {
    apiReq = req.clone({
      url: `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`
    });
  }

  // Add common headers
  if (!apiReq.headers.has('Accept')) {
    apiReq = apiReq.clone({
      setHeaders: {
        'Accept': 'application/json'
      }
    });
  }

  // Add Content-Type for non-FormData requests
  if (!apiReq.headers.has('Content-Type') && !(apiReq.body instanceof FormData)) {
    apiReq = apiReq.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Add API version header
  apiReq = apiReq.clone({
    setHeaders: {
      'X-API-Version': environment.version || '1.0'
    }
  });

  // Add request timestamp for debugging
  if (!environment.production) {
    apiReq = apiReq.clone({
      setHeaders: {
        'X-Request-Time': new Date().toISOString()
      }
    });
  }
  return next(req);
};
