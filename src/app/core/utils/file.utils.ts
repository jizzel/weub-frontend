// import {MIME_TYPE_MAPPING, VIDEO_CONFIG} from '../constants/api.constants';

import {MIME_TYPE_MAPPING, VIDEO_CONFIG} from '../constants/video.constants';

export class FileUtils {
  /**
   * Check if file is a supported video format
   */
  static isVideoFile(file: File): boolean {
    return VIDEO_CONFIG.SUPPORTED_MIME_TYPES.includes(file.type as any) ||
      this.getFileExtension(file.name).toLowerCase() in VIDEO_CONFIG.SUPPORTED_FORMATS;
  }

  /**
   * Check if file size is within allowed limits
   */
  static isFileSizeValid(file: File): boolean {
    return file.size <= VIDEO_CONFIG.MAX_FILE_SIZE;
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Get file extension from MIME type
   */
  static getExtensionFromMimeType(mimeType: string): string {
    return MIME_TYPE_MAPPING[mimeType as keyof typeof MIME_TYPE_MAPPING] || '';
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Convert bytes to megabytes
   */
  static bytesToMB(bytes: number): number {
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
  }

  /**
   * Convert bytes to gigabytes
   */
  static bytesToGB(bytes: number): number {
    return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
  }

  /**
   * Validate file against video requirements
   */
  static validateVideoFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isVideoFile(file)) {
      errors.push(`Unsupported file format. Supported formats: ${VIDEO_CONFIG.SUPPORTED_FORMATS.join(', ')}`);
    }

    if (!this.isFileSizeValid(file)) {
      errors.push(`File size exceeds maximum limit of ${this.formatFileSize(VIDEO_CONFIG.MAX_FILE_SIZE)}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a safe filename from user input
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 100);
  }

  /**
   * Create a file preview URL
   */
  static createFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a file preview URL
   */
  static revokeFilePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Read file as data URL
   */
  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file type category
   */
  static getFileTypeCategory(file: File): 'video' | 'image' | 'other' {
    if (this.isVideoFile(file)) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    return 'other';
  }
}
