import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {apiInterceptor} from './core/interceptors/api-interceptor';
import {loadingInterceptor} from './core/interceptors/loading-interceptor';
import {errorInterceptor} from './core/interceptors/error-interceptor';
import {cacheInterceptor} from './core/interceptors/cache-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor, loadingInterceptor, errorInterceptor, cacheInterceptor])
    )
  ]
};
