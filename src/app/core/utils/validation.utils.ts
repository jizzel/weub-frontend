import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {VALIDATION_PATTERNS, VIDEO_CONFIG} from '../constants/video.constants';

export class ValidationUtils {
  /**
   * title
   * Validate video title
   */
  static validateVideoTitle(title: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (title && title.length > VIDEO_CONFIG.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${VIDEO_CONFIG.MAX_TITLE_LENGTH} characters`);
    }

    if (title && !VALIDATION_PATTERNS.VIDEO_TITLE.test(title)) {
      errors.push('Title contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate video description
   */
  static validateVideoDescription(description: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (description && description.length > VIDEO_CONFIG.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be less than ${VIDEO_CONFIG.MAX_DESCRIPTION_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * tags
   * Validate video tags
   */
  static validateVideoTags(tags: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (tags.length > VIDEO_CONFIG.MAX_TAGS) {
      errors.push(`Maximum ${VIDEO_CONFIG.MAX_TAGS} tags allowed`);
    }

    for (const tag of tags) {
      if (tag.length > VIDEO_CONFIG.MAX_TAG_LENGTH) {
        errors.push(`Tag "${tag}" is too long (max ${VIDEO_CONFIG.MAX_TAG_LENGTH} characters)`);
      }

      if (!VALIDATION_PATTERNS.TAG.test(tag)) {
        errors.push(`Tag "${tag}" contains invalid characters. Use only letters, numbers, hyphens, and underscores`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    return VALIDATION_PATTERNS.UUID.test(uuid);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    return VALIDATION_PATTERNS.URL.test(url);
  }

  /**
   * Angular validator for video title
   */
  static videoTitleValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const title = control.value as string;
      const { isValid, errors } = this.validateVideoTitle(title);
      return isValid ? null : { videoTitle: errors };
    };
  }
}
