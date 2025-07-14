import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Custom validators for Weub application
 * Provides validation for video metadata, tags, and other form fields
 */
export class CustomValidators {

  /**
   * Validates video title format and length
   * @param minLength Minimum length (default: 1)
   * @param maxLength Maximum length (default: 255)
   * @returns ValidatorFn
   */
  static videoTitle(minLength: number = 1, maxLength: number = 255): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const title = control.value.toString().trim();
      const errors: ValidationErrors = {};

      if (title.length < minLength) {
        errors['minLength'] = {
          actualLength: title.length,
          requiredLength: minLength
        };
      }

      if (title.length > maxLength) {
        errors['maxLength'] = {
          actualLength: title.length,
          requiredLength: maxLength
        };
      }

      // Check for invalid characters
      const invalidChars = /[<>:"\/\\|?*]/;
      if (invalidChars.test(title)) {
        errors['invalidCharacters'] = {
          invalidChars: title.match(invalidChars) || []
        };
      }

      // Check for only whitespace
      if (title.length === 0) {
        errors['whitespaceOnly'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validates video description
   * @param maxLength Maximum length (default: 2000)
   * @returns ValidatorFn
   */
  static videoDescription(maxLength: number = 2000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const description = control.value.toString();

      if (description.length > maxLength) {
        return {
          maxLength: {
            actualLength: description.length,
            requiredLength: maxLength
          }
        };
      }

      return null;
    };
  }

  /**
   * Validates tags array
   * @param maxTags Maximum number of tags (default: 10)
   * @param maxTagLength Maximum length per tag (default: 50)
   * @returns ValidatorFn
   */
  static videoTags(maxTags: number = 10, maxTagLength: number = 50): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const tags = Array.isArray(control.value) ? control.value : [];
      const errors: ValidationErrors = {};

      // Check maximum number of tags
      if (tags.length > maxTags) {
        errors['maxTags'] = {
          actualCount: tags.length,
          maxCount: maxTags
        };
      }

      // Validate individual tags
      const invalidTags: any[] = [];
      const duplicateTags: string[] = [];
      const seenTags = new Set<string>();

      tags.forEach((tag: string, index: number) => {
        const trimmedTag = tag.toString().trim().toLowerCase();

        // Check for empty tags
        if (!trimmedTag) {
          invalidTags.push({ index, tag, reason: 'empty' });
          return;
        }

        // Check tag length
        if (trimmedTag.length > maxTagLength) {
          invalidTags.push({
            index,
            tag,
            reason: 'tooLong',
            actualLength: trimmedTag.length,
            maxLength: maxTagLength
          });
        }

        // Check for invalid characters
        const validTagPattern = /^[a-zA-Z0-9\s\-_]+$/;
        if (!validTagPattern.test(trimmedTag)) {
          invalidTags.push({
            index,
            tag,
            reason: 'invalidCharacters'
          });
        }

        // Check for duplicates
        if (seenTags.has(trimmedTag)) {
          duplicateTags.push(trimmedTag);
        } else {
          seenTags.add(trimmedTag);
        }
      });

      if (invalidTags.length > 0) {
        errors['invalidTags'] = invalidTags;
      }

      if (duplicateTags.length > 0) {
        errors['duplicateTags'] = duplicateTags;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validates search query
   * @param minLength Minimum search query length (default: 1)
   * @param maxLength Maximum search query length (default: 100)
   * @returns ValidatorFn
   */
  static searchQuery(minLength: number = 1, maxLength: number = 100): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const query = control.value.toString().trim();
      const errors: ValidationErrors = {};

      if (query.length < minLength) {
        errors['minLength'] = {
          actualLength: query.length,
          requiredLength: minLength
        };
      }

      if (query.length > maxLength) {
        errors['maxLength'] = {
          actualLength: query.length,
          requiredLength: maxLength
        };
      }

      // Check for potentially dangerous characters
      const dangerousChars = /[<>'"]/;
      if (dangerousChars.test(query)) {
        errors['dangerousCharacters'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validates URL format
   * @param allowEmpty Whether to allow empty values (default: true)
   * @returns ValidatorFn
   */
  static url(allowEmpty: boolean = true): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return allowEmpty ? null : { required: true };
      }

      const url = control.value.toString();

      try {
        new URL(url);
        return null;
      } catch {
        return { invalidUrl: { actualValue: url } };
      }
    };
  }

  /**
   * Validates file extension against allowed extensions
   * @param allowedExtensions Array of allowed extensions (without dots)
   * @returns ValidatorFn
   */
  static fileExtension(allowedExtensions: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;

      if (!(file instanceof File)) {
        return { invalidFileType: true };
      }

      const fileName = file.name.toLowerCase();
      const extension = fileName.substring(fileName.lastIndexOf('.') + 1);

      const normalizedAllowed = allowedExtensions.map(ext => ext.toLowerCase());

      if (!normalizedAllowed.includes(extension)) {
        return {
          invalidExtension: {
            actualExtension: extension,
            allowedExtensions: normalizedAllowed
          }
        };
      }

      return null;
    };
  }

  /**
   * Validates video file format
   * @returns ValidatorFn
   */
  static videoFile(): ValidatorFn {
    const allowedExtensions = ['mp4', 'mov', 'webm', 'avi'];
    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
      'video/avi'
    ];

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;

      if (!(file instanceof File)) {
        return { invalidFileType: true };
      }

      const errors: ValidationErrors = {};

      // Check file extension
      const fileName = file.name.toLowerCase();
      const extension = fileName.substring(fileName.lastIndexOf('.') + 1);

      if (!allowedExtensions.includes(extension)) {
        errors['invalidExtension'] = {
          actualExtension: extension,
          allowedExtensions
        };
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(file.type)) {
        errors['invalidMimeType'] = {
          actualMimeType: file.type,
          allowedMimeTypes
        };
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validates that at least one field in a group has a value
   * @param fieldNames Array of field names to check
   * @returns ValidatorFn
   */
  static atLeastOne(fieldNames: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) {
        return null;
      }

      const hasValue = fieldNames.some(fieldName => {
        const field = control.get(fieldName);
        return field && field.value && field.value.toString().trim().length > 0;
      });

      return hasValue ? null : { atLeastOne: { fields: fieldNames } };
    };
  }

  /**
   * Validates date range (from <= to)
   * @param fromFieldName Name of the 'from' date field
   * @param toFieldName Name of the 'to' date field
   * @returns ValidatorFn
   */
  static dateRange(fromFieldName: string, toFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) {
        return null;
      }

      const fromControl = control.get(fromFieldName);
      const toControl = control.get(toFieldName);

      if (!fromControl || !toControl) {
        return null;
      }

      const fromDate = fromControl.value ? new Date(fromControl.value) : null;
      const toDate = toControl.value ? new Date(toControl.value) : null;

      if (fromDate && toDate && fromDate > toDate) {
        return {
          dateRange: {
            from: fromDate,
            to: toDate
          }
        };
      }

      return null;
    };
  }

  /**
   * Validates numeric range
   * @param min Minimum value
   * @param max Maximum value
   * @returns ValidatorFn
   */
  static numericRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value)) {
        return { notANumber: { actualValue: control.value } };
      }

      const errors: ValidationErrors = {};

      if (value < min) {
        errors['min'] = { actualValue: value, minValue: min };
      }

      if (value > max) {
        errors['max'] = { actualValue: value, maxValue: max };
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Get user-friendly error message for custom validation errors
   * @param fieldName Name of the field
   * @param error Validation error object
   * @returns Human readable error message
   */
  static getErrorMessage(fieldName: string, error: any): string {
    // Video title errors
    if (error.minLength) {
      return `${fieldName} must be at least ${error.minLength.requiredLength} characters long`;
    }
    if (error.maxLength) {
      return `${fieldName} cannot exceed ${error.maxLength.requiredLength} characters`;
    }
    if (error.invalidCharacters) {
      return `${fieldName} contains invalid characters: ${error.invalidCharacters.invalidChars.join(', ')}`;
    }
    if (error.whitespaceOnly) {
      return `${fieldName} cannot be empty or contain only whitespace`;
    }

    // Tags errors
    if (error.maxTags) {
      return `Cannot have more than ${error.maxTags.maxCount} tags`;
    }
    if (error.invalidTags) {
      const invalidTag = error.invalidTags[0];
      switch (invalidTag.reason) {
        case 'empty':
          return 'Tags cannot be empty';
        case 'tooLong':
          return `Tag "${invalidTag.tag}" is too long (max ${invalidTag.maxLength} characters)`;
        case 'invalidCharacters':
          return `Tag "${invalidTag.tag}" contains invalid characters`;
        default:
          return 'Invalid tag format';
      }
    }
    if (error.duplicateTags) {
      return `Duplicate tags found: ${error.duplicateTags.join(', ')}`;
    }

    // File errors
    if (error.invalidExtension) {
      return `Invalid file extension. Allowed: ${error.invalidExtension.allowedExtensions.join(', ')}`;
    }
    if (error.invalidMimeType) {
      return `Invalid file type. Expected video file.`;
    }

    // URL errors
    if (error.invalidUrl) {
      return `Invalid URL format`;
    }

    // Range errors
    if (error.min) {
      return `${fieldName} must be at least ${error.min.minValue}`;
    }
    if (error.max) {
      return `${fieldName} cannot exceed ${error.max.maxValue}`;
    }
    if (error.notANumber) {
      return `${fieldName} must be a valid number`;
    }

    // Date range errors
    if (error.dateRange) {
      return 'End date must be after start date';
    }

    // At least one error
    if (error.atLeastOne) {
      return `At least one of the following fields is required: ${error.atLeastOne.fields.join(', ')}`;
    }

    return `${fieldName} is invalid`;
  }
}
