import { HttpInterceptorFn } from '@angular/common/http';
import {finalize} from 'rxjs';
import {inject} from '@angular/core';
import {Loading} from '../services/loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(Loading);

  const skipLoading =
    req.headers.has('X-Skip-Loading') ||
    req.url.includes('/status') ||
    req.url.includes('/health') ||
    (req.method === 'GET' && req.url.includes('/stream/'));

  if (skipLoading) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loading')
    });
    return next(cleanReq);
  }

  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      loadingService.stopLoading();
    })
  );
};
