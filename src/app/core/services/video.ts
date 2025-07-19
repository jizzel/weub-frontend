import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, switchMap, takeUntil, timer} from 'rxjs';
import {VideoDetail, VideoSummary} from '../models/video.model';
import {ApiService} from './api.service';
import {VideoFilters} from '../models/filter.model';
import {PaginationParams} from '../models/pagination.model';
import {VideoListResponse, VideoStatusResponse} from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class Video extends ApiService {
  private videosSubject = new BehaviorSubject<VideoSummary[]>([]);
  private currentVideoSubject = new BehaviorSubject<VideoDetail | null>(null);

  public videos$ = this.videosSubject.asObservable();
  public currentVideo$ = this.currentVideoSubject.asObservable();

  constructor() {
    super('videos');
  }

  // Get paginated list of videos with filters
  getVideos(filters?: VideoFilters, pagination?: PaginationParams): Observable<VideoListResponse> {
    const params = {
      ...filters,
      ...pagination
    };

    return this.get<VideoListResponse>('', params);
  }

  // Get specific video details
  getVideo(videoId: string): Observable<VideoDetail> {
    return this.get<VideoDetail>(videoId).pipe(
      switchMap(video => {
        this.currentVideoSubject.next(video);
        return [video];
      })
    );
  }

  // Get video processing status
  getVideoStatus(videoId: string): Observable<VideoStatusResponse> {
    return this.get<VideoStatusResponse>(`${videoId}/status`);
  }

  // Poll video status until ready or failed
  pollVideoStatus(videoId: string, stopSignal?: Observable<any>): Observable<VideoStatusResponse> {
    return timer(0, 2000).pipe(
      switchMap(() => this.getVideoStatus(videoId)),
      takeUntil(stopSignal || new BehaviorSubject(null))
    );
  }

  // Get video thumbnail URL
  getVideoThumbnailUrl(videoId: string): string {
    return `${'this.baseUrl'}/${videoId}/thumbnail`;
  }

  // Get HLS streaming URL
  getStreamingUrl(videoId: string, resolution: string): string {
    if(resolution) {
      return `/api/v1/stream/${videoId}/${resolution}/playlist.m3u8`;
    }

    return `/api/v1/stream/${videoId}/playlist.m3u8`;
  }

  // Update local video cache
  updateVideoCache(videos: VideoSummary[]): void {
    this.videosSubject.next(videos);
  }

  // Clear current video
  clearCurrentVideo(): void {
    this.currentVideoSubject.next(null);
  }
}
