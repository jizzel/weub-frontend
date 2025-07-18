import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined, format: 'short' | 'long' | 'minimal' = 'short'): string {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      return format === 'minimal' ? '0:00' : '0 seconds';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    switch (format) {
      case 'long':
        return this.formatLongDuration(hours, minutes, secs);

      case 'minimal':
        return this.formatMinimalDuration(hours, minutes, secs);

      case 'short':
      default:
        return this.formatShortDuration(hours, minutes, secs);
    }
  }

  private formatLongDuration(hours: number, minutes: number, seconds: number): string {
    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    }

    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
    }

    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return `${parts[0]} and ${parts[1]}`;
    } else {
      return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
    }
  }

  private formatShortDuration(hours: number, minutes: number, seconds: number): string {
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatMinimalDuration(hours: number, minutes: number, seconds: number): string {
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    if (hours > 0) {
      const paddedHours = hours.toString().padStart(2, '0');
      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
      return `${minutes}:${paddedSeconds}`;
    }
  }
}
