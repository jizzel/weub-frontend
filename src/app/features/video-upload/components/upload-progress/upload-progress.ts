import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadProgress as UP, UploadStatus } from '../../../../core/models/upload.model';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-progress.html',
  styleUrls: ['./upload-progress.css']
})
export class UploadProgress implements OnInit, OnDestroy {
  @Input() uploads: UP[] = [];
  @Input() showCompleted = true;
  @Input() autoHideCompleted = true;
  @Input() autoHideDelay = 3000;

  @Output() cancelUpload = new EventEmitter<string>();
  @Output() retryUpload = new EventEmitter<string>();
  @Output() clearCompleted = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<string>();

  private hideTimers = new Map<string, number>();

  ngOnInit(): void {
    if (this.autoHideCompleted) {
      this.setupAutoHide();
    }
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }

  ngOnChanges(): void {
    if (this.autoHideCompleted) {
      this.setupAutoHide();
    }
  }

  get visibleUploads(): UP[] {
    if (!this.showCompleted) {
      return this.uploads.filter(item => !this.isCompleted(item.status));
    }
    return this.uploads;
  }

  get hasActiveUploads(): boolean {
    return this.uploads.some(item => this.isActive(item.status));
  }

  get hasCompletedUploads(): boolean {
    return this.uploads.some(item => this.isCompleted(item.status));
  }

  get totalProgress(): number {
    if (this.uploads.length === 0) return 0;

    const totalProgress = this.uploads.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / this.uploads.length);
  }

  onCancelUpload(uploadId: string): void {
    this.cancelUpload.emit(uploadId);
  }

  onRetryUpload(uploadId: string): void {
    this.retryUpload.emit(uploadId);
  }

  onRemoveItem(uploadId: string): void {
    this.clearTimer(uploadId);
    this.removeItem.emit(uploadId);
  }

  onClearCompleted(): void {
    this.clearAllTimers();
    this.clearCompleted.emit();
  }

  trackByUploadId(index: number, upload: UP): string {
    return upload.id;
  }

  getStatusIcon(status: UploadStatus): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '📄';
    }
  }

  getStatusText(status: UploadStatus): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getProgressBarClass(status: UploadStatus): string {
    switch (status) {
      case 'uploading':
        return 'progress-uploading';
      case 'processing':
        return 'progress-processing';
      case 'completed':
        return 'progress-completed';
      case 'failed':
        return 'progress-failed';
      case 'cancelled':
        return 'progress-cancelled';
      default:
        return 'progress-pending';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatSpeed(bytesPerSecond: number): string {
    return this.formatFileSize(bytesPerSecond) + '/s';
  }

  formatTimeRemaining(seconds: number): string {
    if (!seconds || seconds <= 0) return '';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
    return `${remainingSeconds}s remaining`;
  }

  canCancel(status: UploadStatus): boolean {
    return ['pending', 'uploading'].includes(status);
  }

  canRetry(status: UploadStatus): boolean {
    return ['failed', 'cancelled'].includes(status);
  }

  canRemove(status: UploadStatus): boolean {
    return ['completed', 'failed', 'cancelled'].includes(status);
  }

  private isActive(status: UploadStatus): boolean {
    return ['pending', 'uploading', 'processing'].includes(status);
  }

  private isCompleted(status: UploadStatus): boolean {
    return ['completed', 'failed', 'cancelled'].includes(status);
  }

  private setupAutoHide(): void {
    this.uploads.forEach(item => {
      if (item.status === 'completed' && !this.hideTimers.has(item.id)) {
        const timerId = window.setTimeout(() => {
          this.onRemoveItem(item.id);
        }, this.autoHideDelay);

        this.hideTimers.set(item.id, timerId);
      }
    });
  }

  private clearTimer(uploadId: string): void {
    const timerId = this.hideTimers.get(uploadId);
    if (timerId) {
      clearTimeout(timerId);
      this.hideTimers.delete(uploadId);
    }
  }

  private clearAllTimers(): void {
    this.hideTimers.forEach(timerId => clearTimeout(timerId));
    this.hideTimers.clear();
  }
}
