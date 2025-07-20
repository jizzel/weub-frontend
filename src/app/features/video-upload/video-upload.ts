import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { UploadProgress } from '../../core/models/upload.model';
import {UploadForm} from './components/upload-form/upload-form';
import {FileDropzone} from './components/file-dropzone/file-dropzone';
import { UploadProgress as UploadProgressComponent} from './components/upload-progress/upload-progress';
import {Upload} from '../../core/services/upload';

@Component({
  selector: 'app-video-upload',
  imports: [CommonModule,
    UploadForm,
    FileDropzone,
    UploadProgressComponent],
  templateUrl: './video-upload.html',
  standalone: true,
  styleUrl: './video-upload.css'
})
export class VideoUpload implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress$: Observable<UploadProgress[]>;

  readonly allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  readonly maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB

  private destroy$ = new Subject<void>();

  constructor(
    private uploadService: Upload,
    private notificationService: NotificationService
  ) {
    this.uploadProgress$ = this.uploadService.uploadProgress$;
  }

  ngOnInit(): void {
    // Subscribe to upload progress for UI updates
    this.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(uploads => {
        // Check if any uploads completed
        const completed = uploads.filter(u => u.status === 'completed');
        completed.forEach(upload => {
          if (upload.progress === 100) {
            this.notificationService.success(
              'Upload completed',
              `Video "${upload.filename}" uploaded successfully!`
            );
          }
        });

        // Check for failed uploads
        const failed = uploads.filter(u => u.status === 'failed');
        failed.forEach(upload => {
          this.notificationService.error(
            'Upload failed',
            `Upload failed for "${upload.filename}"`
          );
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(file: File): void {
    const validation = this.uploadService.validateFile(file);

    if (!validation.valid) {
      this.onFileError({reason: validation.error || 'Invalid file'});
      return;
    }

    this.selectedFile = file;
    this.notificationService.success('File Selected', `File "${file.name}" selected successfully`);
  }

  onFileError(event: {file?: File, reason: string}): void {
    this.notificationService.error('File Error', event.reason);
  }

  onUploadStarted(uploadData: any): void {
    this.isUploading = true;

    this.uploadService.uploadVideo(uploadData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.response) {
            // Upload completed successfully
            this.isUploading = false;
            this.selectedFile = null;
            this.notificationService.success(
              'Upload Successful',
              'Upload completed! Your video is being processed and will be available for streaming soon.'
            );
          }
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Upload error:', error);
          this.notificationService.error('Upload failed', 'Upload failed. Please try again.');
        }
      });
  }

  onUploadCanceled(): void {
    this.isUploading = false;
    this.selectedFile = null;
  }

  onFileRemoved(): void {
    this.selectedFile = null;
  }

  cancelUpload(uploadId: string): void {
    this.uploadService.cancelUpload(uploadId);
    this.notificationService.info('', 'Upload canceled');
  }

  clearCompleted(): void {
    this.uploadService.clearCompletedUploads();
  }

  get hasCompletedUploads(): boolean {
    // This would need to be implemented based on current upload progress
    return true; // Simplified for now
  }
}
