import {inject, Injectable} from '@angular/core';
import {NotificationService} from './notification.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ApiError} from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandler {
  private notificationService = inject(NotificationService)
  constructor() {}

  // Handle HTTP errors
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
      apiError = {
        code: 'CLIENT_ERROR',
        message: 'A network error occurred. Please check your connection.',
        details: { originalError: error.error.message }
      };
    } else {
      // Server-side error
      console.error('Server error:', error);
      apiError = this.parseServerError(error);
    }

    this.showErrorNotification(apiError);
    return throwError(() => apiError);
  }

  // Handle application errors
  handleAppError(error: Error): void {
    console.error('Application error:', error);

    const apiError: ApiError = {
      code: 'APP_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { stack: error.stack }
    };

    this.showErrorNotification(apiError);
  }

  // Handle upload errors
  handleUploadError(error: any): ApiError {
    let apiError: ApiError;

    if (error.status === 413) {
      apiError = {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the 2GB limit',
        details: { maxSize: '2GB' }
      };
    } else if (error.status === 415) {
      apiError = {
        code: 'UNSUPPORTED_FORMAT',
        message: 'Unsupported file format. Please upload MP4, MOV, WEBM, or AVI files.',
        details: { supportedFormats: ['MP4', 'MOV', 'WEBM', 'AVI'] }
      };
    } else {
      apiError = {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload file. Please try again.',
        details: { error: error.message }
      };
    }

    this.showErrorNotification(apiError);
    return apiError;
  }

  // Handle video processing errors
  handleProcessingError(videoId: string, error: any): void {
    const apiError: ApiError = {
      code: 'PROCESSING_ERROR',
      message: 'Video processing failed. Please try uploading again.',
      details: { videoId, error: error.message }
    };

    this.showErrorNotification(apiError);
  }

  // Handle streaming errors
  handleStreamingError(error: any): void {
    let message = 'Video streaming error occurred';

    if (error.code === 'NETWORK_ERROR') {
      message = 'Network error while streaming. Please check your connection.';
    } else if (error.code === 'DECODE_ERROR') {
      message = 'Video format not supported by your browser.';
    } else if (error.code === 'MEDIA_ERROR') {
      message = 'Media playback error. Please try refreshing the page.';
    }

    const apiError: ApiError = {
      code: 'STREAMING_ERROR',
      message,
      details: { originalError: error }
    };

    this.showErrorNotification(apiError);
  }

  private parseServerError(error: HttpErrorResponse): ApiError {
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required.',
      403: 'Access denied.',
      404: 'Resource not found.',
      409: 'Conflict with existing resource.',
      422: 'Invalid data provided.',
      429: 'Too many requests. Please try again later.',
      500: 'Internal server error. Please try again later.',
      502: 'Server temporarily unavailable.',
      503: 'Service temporarily unavailable.',
      504: 'Request timeout. Please try again.'
    };

    const message = error.error?.error?.message ||
      statusMessages[error.status] ||
      'An unexpected server error occurred';

    return {
      code: error.error?.error?.code || `HTTP_${error.status}`,
      message,
      details: {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        ...error.error?.error?.details
      }
    };
  }

  private showErrorNotification(error: ApiError): void {
    this.notificationService.error(
      'Error',
      error.message,
      true // persistent for errors
    );
  }
}
