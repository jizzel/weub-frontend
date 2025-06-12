import {VideoDetail, VideoResolution, VideoStatus, VideoSummary} from './video.model';
import {Pagination} from './pagination.model';

export interface BaseResponse<T = any> {
  data: T;
  statusCode: number;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ErrorResponse extends BaseResponse<null> {
  error: ApiError;
}

export interface VideoListResponse extends BaseResponse<{
  videos: VideoSummary[];
  pagination: Pagination;
}> {}

export interface VideoDetailResponse extends BaseResponse<VideoDetail> {}

export interface VideoStatusResponse extends BaseResponse<{
  id: string;
  status: VideoStatus;
  progress?: number;
  estimatedTimeRemaining?: string;
  currentTask?: string;
  completedResolutions: VideoResolution[];
  failedResolutions: VideoResolution[];
  lastUpdated: string;
}> {}

export interface UploadResponse extends BaseResponse<{
  id: string;
  title: string;
  status: VideoStatus;
  originalFilename: string;
  fileSize: number;
  uploadedAt: string;
  estimatedProcessingTime: string;
}> {}

export interface HealthResponse extends BaseResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    redis: 'connected' | 'disconnected' | 'error';
    storage: 'available' | 'unavailable' | 'error';
  };
  stats: {
    totalVideos: number;
    videosReady: number;
    videosProcessing: number;
    videosFailed: number;
    queueSize: number;
    storageUsed: string;
  };
}> {}

export interface StatsResponse extends BaseResponse<{
  overview: {
    totalVideos: number;
    totalViews: number;
    totalStorageUsed: number;
    averageProcessingTime: number;
  };
  processingStats: {
    videosReady: number;
    videosProcessing: number;
    videosPending: number;
    videosFailed: number;
    successRate: number;
  };
  popularResolutions: Array<{
    resolution: VideoResolution;
    count: number;
  }>;
  recentActivity: {
    uploadsToday: number;
    uploadsThisWeek: number;
    processingTimeToday: number;
  };
}> {}
