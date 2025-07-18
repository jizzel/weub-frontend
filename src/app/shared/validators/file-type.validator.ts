import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface FileTypeValidatorOptions {
  allowedTypes: string[];
  caseSensitive?: boolean;
}

export function fileTypeValidator(options: FileTypeValidatorOptions): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null; // Don't validate empty values, use required validator for that
    }

    if (!(file instanceof File)) {
      return { fileType: { message: 'Value must be a File object' } };
    }

    const { allowedTypes, caseSensitive = false } = options;
    const fileName = caseSensitive ? file.name : file.name.toLowerCase();
    const fileType = caseSensitive ? file.type : file.type.toLowerCase();

    const isValid = allowedTypes.some(type => {
      const checkType = caseSensitive ? type : type.toLowerCase();

      // Handle MIME types (e.g., 'video/mp4')
      if (checkType.includes('/')) {
        return fileType === checkType;
      }

      // Handle extensions (e.g., '.mp4')
      if (checkType.startsWith('.')) {
        return fileName.endsWith(checkType);
      }

      // Handle generic types (e.g., 'mp4')
      return fileName.endsWith(`.${checkType}`);
    });

    if (!isValid) {
      return {
        fileType: {
          actualType: file.type,
          actualName: file.name,
          allowedTypes: allowedTypes,
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        }
      };
    }

    return null;
  };
}
