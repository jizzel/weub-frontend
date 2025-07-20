import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, suffix: boolean = true): string {
    if (!value) {
      return 'Unknown';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Future dates
    if (secondsAgo < 0) {
      return this.formatFutureTime(Math.abs(secondsAgo), suffix);
    }

    return this.formatPastTime(secondsAgo, suffix);
  }

  private formatPastTime(secondsAgo: number, suffix: boolean): string {
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    if (secondsAgo < 10) {
      return 'just now';
    }

    for (const interval of intervals) {
      const count = Math.floor(secondsAgo / interval.seconds);

      if (count >= 1) {
        const plural = count !== 1 ? 's' : '';
        const timeString = `${count} ${interval.label}${plural}`;
        return suffix ? `${timeString} ago` : timeString;
      }
    }

    return 'just now';
  }

  private formatFutureTime(secondsFromNow: number, suffix: boolean): string {
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(secondsFromNow / interval.seconds);

      if (count >= 1) {
        const plural = count !== 1 ? 's' : '';
        const timeString = `${count} ${interval.label}${plural}`;
        return suffix ? `in ${timeString}` : timeString;
      }
    }

    return 'now';
  }
}
