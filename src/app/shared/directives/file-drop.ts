import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

export interface FileDropEvent {
  files: FileList;
  event: DragEvent;
}

@Directive({
  selector: '[appFileDrop]',
})
export class FileDrop {
  @Input() allowedTypes: string[] = [];
  @Input() maxFileSize?: number;
  @Input() multiple = false;
  @Input() disabled = false;

  @Output() filesDropped = new EventEmitter<FileDropEvent>();
  @Output() filesHovered = new EventEmitter<boolean>();
  @Output() filesRejected = new EventEmitter<{ files: File[], reason: string }>();

  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter++;

    if (this.dragCounter === 1) {
      this.renderer.addClass(this.el.nativeElement, 'drag-over');
      this.filesHovered.emit(true);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    // Change cursor to indicate drop is allowed
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter--;

    if (this.dragCounter === 0) {
      this.renderer.removeClass(this.el.nativeElement, 'drag-over');
      this.filesHovered.emit(false);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter = 0;
    this.renderer.removeClass(this.el.nativeElement, 'drag-over');
    this.filesHovered.emit(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    // Validate files
    const validationResult = this.validateFiles(files);

    if (validationResult.valid.length > 0) {
      const validFileList = this.createFileList(validationResult.valid);
      this.filesDropped.emit({ files: validFileList, event });
    }

    if (validationResult.invalid.length > 0) {
      this.filesRejected.emit({
        files: validationResult.invalid,
        reason: validationResult.reason
      });
    }
  }

  private validateFiles(files: FileList): {
    valid: File[];
    invalid: File[];
    reason: string;
  } {
    const fileArray = Array.from(files);
    const valid: File[] = [];
    const invalid: File[] = [];
    let reason = '';

    // Check if multiple files are allowed
    if (!this.multiple && fileArray.length > 1) {
      return {
        valid: [],
        invalid: fileArray,
        reason: 'Only single file upload is allowed'
      };
    }

    for (const file of fileArray) {
      // Check file type
      if (this.allowedTypes.length > 0 && !this.isValidFileType(file)) {
        invalid.push(file);
        reason = `File type not allowed. Allowed types: ${this.allowedTypes.join(', ')}`;
        continue;
      }

      // Check file size
      if (this.maxFileSize && file.size > this.maxFileSize) {
        invalid.push(file);
        reason = `File size exceeds maximum allowed size of ${this.formatFileSize(this.maxFileSize)}`;
        continue;
      }

      valid.push(file);
    }

    return { valid, invalid, reason };
  }

  private isValidFileType(file: File): boolean {
    return this.allowedTypes.some(type => {
      // Handle MIME types (e.g., 'video/mp4')
      if (type.includes('/')) {
        return file.type === type;
      }

      // Handle extensions (e.g., '.mp4')
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }

      // Handle generic types (e.g., 'mp4')
      return file.name.toLowerCase().endsWith(`.${type.toLowerCase()}`);
    });
  }

  private createFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
