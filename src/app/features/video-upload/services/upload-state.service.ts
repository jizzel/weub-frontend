import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UploadProgress } from '../../../core/models/upload.model';

export interface UploadState {
  uploads: UploadProgress[];
  activeCount: number;
  completedCount: number;
  failedCount: number;
  totalUploaded: number;
}

export interface UploadFormData {
  file: File | null;
  title: string;
  description: string;
  tags: string[];
  isValid: boolean;
  errors: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class UploadStateService {
  private uploadStateSubject = new BehaviorSubject<UploadState>({
    uploads: [],
    activeCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalUploaded: 0
  });

  private formDataSubject = new BehaviorSubject<UploadFormData>({
    file: null,
    title: '',
    description: '',
    tags: [],
    isValid: false,
    errors: {}
  });

  private notificationSubject = new Subject<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>();

  public uploadState$ = this.uploadStateSubject.asObservable();
  public formData$ = this.formDataSubject.asObservable();
  public notifications$ = this.notificationSubject.asObservable();

  constructor() {}

  // Upload State Management
  addUpload(upload: UploadProgress): void {
    const currentState = this.uploadStateSubject.value;
    const newUploads = [...currentState.uploads, upload];

    this.updateUploadState(newUploads);
  }

  updateUpload(uploadId: string, updates: Partial<UploadProgress>): void {
    const currentState = this.uploadStateSubject.value;
    const uploadIndex = currentState.uploads.findIndex(u => u.id === uploadId);

    if (uploadIndex >= 0) {
      const newUploads = [...currentState.uploads];
      newUploads[uploadIndex] = { ...newUploads[uploadIndex], ...updates };

      this.updateUploadState(newUploads);
    }
  }

  removeUpload(uploadId: string): void {
    const currentState = this.uploadStateSubject.value;
    const newUploads = currentState.uploads.filter(u => u.id !== uploadId);

    this.updateUploadState(newUploads);
  }

  clearCompletedUploads(): void {
    const currentState = this.uploadStateSubject.value;
    const newUploads = currentState.uploads.filter(
      u => !['completed', 'failed', 'cancelled'].includes(u.status)
    );

    this.updateUploadState(newUploads);

    this.showNotification({
      type: 'info',
      message: 'Completed uploads cleared',
      duration: 3000
    });
  }

  clearAllUploads(): void {
    this.updateUploadState([]);

    this.showNotification({
      type: 'info',
      message: 'All uploads cleared',
      duration: 3000
    });
  }

  getUploadById(uploadId: string): UploadProgress | undefined {
    const currentState = this.uploadStateSubject.value;
    return currentState.uploads.find(u => u.id === uploadId);
  }

  private updateUploadState(uploads: UploadProgress[]): void {
    const activeCount = uploads.filter(u =>
      u.status === 'uploading' || u.status === 'pending'
    ).length;

    const completedCount = uploads.filter(u => u.status === 'completed').length;
    const failedCount = uploads.filter(u => u.status === 'failed').length;
    const totalUploaded = uploads.reduce((sum, u) => sum + (u.uploaded || 0), 0);

    this.uploadStateSubject.next({
      uploads,
      activeCount,
      completedCount,
      failedCount,
      totalUploaded
    });
  }

  // Form Data Management
  updateFormData(updates: Partial<UploadFormData>): void {
    const currentData = this.formDataSubject.value;
    const newData = { ...currentData, ...updates };

    // Validate form
    newData.isValid = this.validateForm(newData);

    this.formDataSubject.next(newData);
  }

  setFile(file: File): void {
    this.updateFormData({
      file,
      errors: { ...this.formDataSubject.value.errors, file: '' }
    });
  }

  setTitle(title: string): void {
    this.updateFormData({
      title,
      errors: { ...this.formDataSubject.value.errors, title: '' }
    });
  }

  setDescription(description: string): void {
    this.updateFormData({ description });
  }

  setTags(tags: string[]): void {
    this.updateFormData({ tags });
  }

  addTag(tag: string): void {
    const currentData = this.formDataSubject.value;
    const trimmedTag = tag.trim().toLowerCase();

    if (trimmedTag && !currentData.tags.includes(trimmedTag)) {
      const newTags = [...currentData.tags, trimmedTag];
      this.updateFormData({ tags: newTags });
    }
  }

  removeTag(tag: string): void {
    const currentData = this.formDataSubject.value;
    const newTags = currentData.tags.filter(t => t !== tag);
    this.updateFormData({ tags: newTags });
  }

  resetForm(): void {
    this.formDataSubject.next({
      file: null,
      title: '',
      description: '',
      tags: [],
      isValid: false,
      errors: {}
    });
  }

  private validateForm(data: UploadFormData): boolean {
    const errors: { [key: string]: string } = {};

    // Validate file
    if (!data.file) {
      errors['file'] = 'Please select a video file';
    }

    // Validate title
    if (!data.title.trim()) {
      errors['title'] = 'Title is required';
    } else if (data.title.trim().length < 3) {
      errors['title'] = 'Title must be at least 3 characters long';
    } else if (data.title.trim().length > 100) {
      errors['title'] = 'Title must be less than 100 characters';
    }

    // Validate description (optional but with limits)
    if (data.description.length > 500) {
      errors['description'] = 'Description must be less than 500 characters';
    }

    // Validate tags
    if (data.tags.length > 10) {
      errors['tags'] = 'Maximum 10 tags allowed';
    }

    // Update errors in the form data
    data.errors = errors;

    return Object.keys(errors).length === 0;
  }

  // Notification Management
  showNotification(notification: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }): void {
    this.notificationSubject.next({
      duration: 5000, // Default 5 seconds
      ...notification
    });
  }

  // Utility Methods
  getUploadStatusCounts(): { active: number; completed: number; failed: number } {
    const state = this.uploadStateSubject.value;
    return {
      active: state.activeCount,
      completed: state.completedCount,
      failed: state.failedCount
    };
  }

  hasActiveUploads(): boolean {
    return this.uploadStateSubject.value.activeCount > 0;
  }

  getFormErrors(): { [key: string]: string } {
    return this.formDataSubject.value.errors;
  }

  isFormValid(): boolean {
    return this.formDataSubject.value.isValid;
  }

  generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  calculateProgress(uploaded: number, total: number): number {
    return total > 0 ? Math.round((uploaded / total) * 100) : 0;
  }

  getUploadSpeed(uploaded: number, startTime: number): string {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    if (elapsedSeconds === 0) return '0 B/s';

    const bytesPerSecond = uploaded / elapsedSeconds;
    return this.formatBytes(bytesPerSecond) + '/s';
  }

  getEstimatedTimeRemaining(uploaded: number, total: number, startTime: number): string {
    if (uploaded === 0) return 'Calculating...';

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = uploaded / elapsedSeconds;
    const remainingBytes = total - uploaded;
    const remainingSeconds = remainingBytes / bytesPerSecond;

    if (remainingSeconds < 60) {
      return Math.round(remainingSeconds) + 's';
    } else if (remainingSeconds < 3600) {
      return Math.round(remainingSeconds / 60) + 'm';
    } else {
      return Math.round(remainingSeconds / 3600) + 'h';
    }
  }
}
