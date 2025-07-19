import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UploadRequest} from '../../../../core/models/upload.model';


@Component({
  selector: 'app-upload-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-form.html',
  standalone: true,
  styleUrl: './upload-form.css'
})
export class UploadForm implements OnInit {
  @Input() selectedFile!: File;
  @Input() isUploading = false;

  @Output() uploadStarted = new EventEmitter<UploadRequest>();
  @Output() uploadCanceled = new EventEmitter<void>();
  @Output() fileRemoved = new EventEmitter<void>();

  uploadForm!: FormGroup;
  parsedTags: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupTagsWatcher();
  }

  private initializeForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      tagsInput: ['']
    });

    // Auto-populate title from filename
    if (this.selectedFile) {
      const nameWithoutExt = this.selectedFile.name.replace(/\.[^/.]+$/, '');
      this.uploadForm.patchValue({
        title: nameWithoutExt
      });
    }
  }

  private setupTagsWatcher(): void {
    this.uploadForm.get('tagsInput')?.valueChanges.subscribe(value => {
      this.parsedTags = this.parseTags(value || '');
    });
  }

  private parseTags(input: string): string[] {
    if (!input.trim()) return [];

    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  }

  onSubmit(): void {
    if (this.uploadForm.valid && !this.isUploading) {
      const formValue = this.uploadForm.value;

      const uploadRequest: UploadRequest = {
        file: this.selectedFile,
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
        tags: this.parsedTags.length > 0 ? this.parsedTags : undefined
      };

      this.uploadStarted.emit(uploadRequest);
    }
  }

  cancelUpload(): void {
    this.uploadCanceled.emit();
  }

  removeFile(): void {
    this.fileRemoved.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.uploadForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
