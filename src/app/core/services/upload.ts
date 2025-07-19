import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, finalize, Observable, Subject, tap} from 'rxjs';
import {UploadProgress, UploadRequest} from '../models/upload.model';
import {UploadResponse} from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class Upload extends ApiService {
  private uploadProgressSubject = new BehaviorSubject<UploadProgress[]>([]);
  private activeUploads = new Map<string, Subject<void>>();

  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor() {
    super('videos');
  }

  // Upload video file
  uploadVideo(uploadRequest: UploadRequest): Observable<{ progress: number; response?: UploadResponse }> {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    formData.append('title', uploadRequest.title);

    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }

    if (uploadRequest.tags && uploadRequest.tags.length > 0) {
      uploadRequest.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }

    const uploadId = this.generateUploadId();
    const cancelSubject = new Subject<void>();
    this.activeUploads.set(uploadId, cancelSubject);

    // Initialize upload progress
    this.updateUploadProgress({
      id: uploadId,
      filename: uploadRequest.file.name,
      size: uploadRequest.file.size,
      uploaded: 0,
      progress: 0,
      status: 'pending'
    });

    return this.upload<UploadResponse>('upload', formData).pipe(
      tap((event) => {
        if (event.progress !== undefined) {
          this.updateUploadProgress({
            id: uploadId,
            filename: uploadRequest.file.name,
            size: uploadRequest.file.size,
            uploaded: Math.round((event.progress / 100) * uploadRequest.file.size),
            progress: event.progress,
            status: event.progress === 100 ? 'completed' : 'uploading'
          });
        }
      }),
      finalize(() => {
        this.activeUploads.delete(uploadId);
      })
    );
  }

  // Cancel upload
  cancelUpload(uploadId: string): void {
    const cancelSubject = this.activeUploads.get(uploadId);
    if (cancelSubject) {
      cancelSubject.next();
      cancelSubject.complete();
      this.activeUploads.delete(uploadId);

      this.updateUploadProgress({
        id: uploadId,
        status: 'cancelled'
      });
    }
  }

  // Clear completed uploads
  clearCompletedUploads(): void {
    const currentProgress = this.uploadProgressSubject.value;
    const activeUploads = currentProgress.filter(
      upload => !['completed', 'failed', 'cancelled'].includes(upload.status)
    );
    this.uploadProgressSubject.next(activeUploads);
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file format. Please upload MP4, MOV, WEBM, or AVI files.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 2GB limit.'
      };
    }

    return { valid: true };
  }

  private updateUploadProgress(progress: Partial<UploadProgress> & { id: string }): void {
    const currentProgress = this.uploadProgressSubject.value;
    const index = currentProgress.findIndex(p => p.id === progress.id);

    if (index >= 0) {
      currentProgress[index] = { ...currentProgress[index], ...progress };
    } else {
      currentProgress.push(progress as UploadProgress);
    }

    this.uploadProgressSubject.next([...currentProgress]);
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
