import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface VideoCardData {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  uploadDate: Date;
  duration?: number;
  thumbnailUrl?: string;
  availableResolutions: string[];
  tags?: string[];
  fileSize?: number;
}

@Component({
  selector: 'app-video-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './video-card.html',
  styleUrl: './video-card.css'
})
export class VideoCard {
  @Input() video!: VideoCardData;
  @Output() play = new EventEmitter<VideoCardData>();
  @Output() titleClick = new EventEmitter<VideoCardData>();
  @Output() tagClick = new EventEmitter<string>();
  @Output() share = new EventEmitter<VideoCardData>();
  @Output() retry = new EventEmitter<VideoCardData>();
  @Output() more = new EventEmitter<VideoCardData>();

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'processing': 'Processing',
      'ready': 'Ready',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatUploadDate(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  onPlayClick(): void {
    if (this.video.status === 'ready') {
      this.play.emit(this.video);
    }
  }

  onTitleClick(): void {
    this.titleClick.emit(this.video);
  }

  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }

  onShareClick(): void {
    this.share.emit(this.video);
  }

  onRetryClick(): void {
    this.retry.emit(this.video);
  }

  onMoreClick(): void {
    this.more.emit(this.video);
  }
}
