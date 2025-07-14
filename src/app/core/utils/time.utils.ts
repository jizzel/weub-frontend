export class TimeUtils {
  /**
   * Format duration in seconds to HH:MM:SS or MM:SS format
   */
  static formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Parse duration string (HH:MM:SS or MM:SS) to seconds
   */
  static parseDuration(duration: string): number {
    const parts = duration.split(':').map(Number);

    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
  }

  /**
   * Format time ago (e.g., "2 hours ago", "3 days ago")
   */
  static timeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }

  /**
   * Format date to readable string
   */
  static formatDate(date: Date | string, includeTime: boolean = false): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return d.toLocaleDateString('en-US', options);
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date | string): boolean {
    const today = new Date();
    const checkDate = new Date(date);

    return today.toDateString() === checkDate.toDateString();
  }

  /**
   * Check if date is within last week
   */
  static isWithinLastWeek(date: Date | string): boolean {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return new Date(date) >= weekAgo;
  }

  /**
   * Estimate remaining time based on progress
   */
  static estimateRemainingTime(progress: number, elapsedMs: number): string {
    if (progress <= 0 || progress >= 100) return 'Unknown';

    const remainingProgress = 100 - progress;
    const timePerPercent = elapsedMs / progress;
    const remainingMs = remainingProgress * timePerPercent;

    return this.formatDuration(Math.floor(remainingMs / 1000));
  }

  /**
   * Convert milliseconds to seconds
   */
  static msToSeconds(ms: number): number {
    return Math.floor(ms / 1000);
  }

  /**
   * Convert seconds to milliseconds
   */
  static secondsToMs(seconds: number): number {
    return seconds * 1000;
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Sleep/delay function
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
