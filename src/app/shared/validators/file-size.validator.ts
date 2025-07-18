import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface FileSizeValidatorOptions {
  maxSize?: number;
  minSize?: number;
}

export function fileSizeValidator(options: FileSizeValidatorOptions): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null; // Don't validate empty values
    }

    if (!(file instanceof File)) {
      return { fileSize: { message: 'Value must be a File object' } };
    }

    const { maxSize, minSize } = options;
    const fileSize = file.size;
    const errors: any = {};

    if (maxSize !== undefined && fileSize > maxSize) {
      errors.maxSize = {
        actualSize: fileSize,
        maxSize: maxSize,
        message: `File size (${formatBytes(fileSize)}) exceeds maximum allowed size (${formatBytes(maxSize)})`
      };
    }

    if (minSize !== undefined && fileSize < minSize) {
      errors.minSize = {
        actualSize: fileSize,
        minSize: minSize,
        message: `File size (${formatBytes(fileSize)}) is below minimum required size (${formatBytes(minSize)})`
      };
    }

    return Object.keys(errors).length > 0 ? { fileSize: errors } : null;
  };
}

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(k)) : 0;

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Max-only file size validator */
export function maxFileSizeValidator(maxSize: number): ValidatorFn {
  const option: FileSizeValidatorOptions = { maxSize, minSize: 0};
  return fileSizeValidator(option);
}

/** Min-only file size validator */
export function minFileSizeValidator(minSize: number): ValidatorFn {
  const option: FileSizeValidatorOptions = { maxSize: Number.MAX_SAFE_INTEGER, minSize };
  return fileSizeValidator(option);
}

/** Specialized for video uploads (defaults to 2GB max) */
export function videoSizeValidator(maxSize: number = 2 * 1024 * 1024 * 1024): ValidatorFn {
  return maxFileSizeValidator(maxSize);
}

/** Multiple files validator */
export function multipleFileSizeValidator(
  maxSize: number,
  maxTotalSize?: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const files = Array.isArray(control.value) ? control.value : [control.value];
    const errors: ValidationErrors = {};
    let totalSize = 0;

    files.forEach((file: File, i: number) => {
      if (!(file instanceof File)) return;
      totalSize += file.size;

      if (file.size > maxSize) {
        errors[`file${i}MaxSize`] = {
          fileName: file.name,
          actualSize: file.size,
          maxSize,
          actualSizeFormatted: formatBytes(file.size),
          maxSizeFormatted: formatBytes(maxSize)
        };
      }
    });

    if (maxTotalSize && totalSize > maxTotalSize) {
      errors['totalMaxSize'] = {
        actualSize: totalSize,
        maxSize: maxTotalSize,
        actualSizeFormatted: formatBytes(totalSize),
        maxSizeFormatted: formatBytes(maxTotalSize)
      };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/** Get human-readable error message for display */
export function getFileSizeErrorMessage(error: any): string {
  if (error.maxSize) {
    return `File size (${error.maxSize.actualSizeFormatted}) exceeds maximum allowed size (${error.maxSize.maxSizeFormatted})`;
  }

  if (error.minSize) {
    return `File size (${error.minSize.actualSizeFormatted}) is below minimum required size (${error.minSize.minSizeFormatted})`;
  }

  if (error.totalMaxSize) {
    return `Total file size (${error.totalMaxSize.actualSizeFormatted}) exceeds maximum allowed total size (${error.totalMaxSize.maxSizeFormatted})`;
  }

  const fileErrors = Object.keys(error).filter(key => key.includes('MaxSize'));
  if (fileErrors.length > 0) {
    const fileError = error[fileErrors[0]];
    return `File "${fileError.fileName}" size (${fileError.actualSizeFormatted}) exceeds maximum allowed size (${fileError.maxSizeFormatted})`;
  }

  return 'File size validation failed';
}
