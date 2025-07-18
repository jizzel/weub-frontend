import { Component, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileDrop, FileDropEvent} from '../../../../shared/directives/file-drop';


@Component({
  selector: 'app-file-dropzone',
  imports: [CommonModule, FileDrop],
  templateUrl: './file-dropzone.html',
  standalone: true,
  styleUrl: './file-dropzone.css'
})
export class FileDropzone {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() allowedTypes: string[] = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  @Input() maxFileSize: number = 2 * 1024 * 1024 * 1024; // 2GB
  @Input() disabled: boolean = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRejected = new EventEmitter<{ file?: File; reason: string }>();

  isDragActive = false;
  errorMessage = '';

  get acceptAttribute(): string {
    return this.allowedTypes.join(',');
  }

  onFilesDropped(event: FileDropEvent): void {
    this.clearError();

    if (event.files.length > 0) {
      const file = event.files[0];
      this.fileSelected.emit(file);
    }
  }

  onFilesHovered(isHovering: boolean): void {
    this.isDragActive = isHovering;
  }

  onFilesRejected(event: { files: File[], reason: string }): void {
    this.errorMessage = event.reason;
    this.fileRejected.emit({
      file: event.files[0],
      reason: event.reason
    });

    // Clear error after 5 seconds
    setTimeout(() => this.clearError(), 5000);
  }

  openFileDialog(): void {
    if (this.disabled) return;

    this.clearError();
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file
      const validation = this.validateFile(file);
      if (validation.valid) {
        this.fileSelected.emit(file);
      } else {
        this.errorMessage = validation.error || 'Invalid file';
        this.fileRejected.emit({
          file,
          reason: validation.error || 'Invalid file'
        });

        // Clear error after 5 seconds
        setTimeout(() => this.clearError(), 5000);
      }
    }

    // Reset input value
    input.value = '';
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file format. Please upload ${this.formatAllowedTypes()}.`
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatMaxFileSize()} limit.`
      };
    }

    return { valid: true };
  }

  private clearError(): void {
    this.errorMessage = '';
  }

  formatAllowedTypes(): string {
    const typeMap: { [key: string]: string } = {
      'video/mp4': 'MP4',
      'video/quicktime': 'MOV',
      'video/webm': 'WEBM',
      'video/x-msvideo': 'AVI'
    };

    return this.allowedTypes
      .map(type => typeMap[type] || type)
      .join(', ');
  }

  formatMaxFileSize(): string {
    const bytes = this.maxFileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
