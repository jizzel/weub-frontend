import {inject} from '@angular/core';
import {HttpClient, HttpParams, HttpEvent, HttpEventType, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseResponse, ApiError } from '../models/api-response.model';


export abstract class ApiService {
  private readonly baseUrl = environment.apiUrl;
  protected readonly http = inject(HttpClient);

  constructor(protected endpoint: string) {
    this.baseUrl = `${environment.apiUrl}/${endpoint}`;
  }

  get<T>(path: string, params?: Record<string, any>, headers?: HttpHeaders): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }

    const options = {
      headers: headers || this.getHeaders(),
      params: httpParams
    };

    return this.http.get<BaseResponse<T>>(`${this.baseUrl}/${path}`, options)
      .pipe(
        retry(environment.polling.maxRetries),
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  post<T>(path: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<BaseResponse<T>>(`${this.baseUrl}/${path}`, data, { headers: headers || this.getHeaders() })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  put<T>(path: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<BaseResponse<T>>(`${this.baseUrl}/${path}`, data, { headers: headers || this.getHeaders() })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  patch<T>(path: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<BaseResponse<T>>(`${this.baseUrl}/${path}`, data, { headers: headers || this.getHeaders() })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  delete<T>(path: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<BaseResponse<T>>(`${this.baseUrl}/${path}`, { headers: headers || this.getHeaders() })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  upload<T>(path: string, formData: FormData, headers?: HttpHeaders): Observable<HttpEvent<BaseResponse<T>>> {
    return this.http.post<BaseResponse<T>>(`${this.baseUrl}/${path}`, formData, {
      headers: headers || new HttpHeaders(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  protected getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private handleResponse<T>(response: BaseResponse<T>): T {
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
      apiError = {
        message: error.error.message,
        code: 'CLIENT_ERROR',
        details: {error: error.status}
      };
    } else {
      // Server-side error
      console.error('Server error:', error);
      apiError = {
        message: error.error?.error || 'An unexpected error occurred',
        code: error.error?.code || 'SERVER_ERROR',
        details: {error: error.status}
      };
    }

    return throwError(() => apiError);
  }
}
