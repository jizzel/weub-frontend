export interface VideoSummary {
  id: string;
  title: string;
  description?: string;
  status: VideoStatus;
  duration?: number;
  fileSize: number;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  processedAt?: string;
  availableResolutions: VideoResolution[];
  streamingUrls: Record<string, string>;
}

export interface VideoDetail extends VideoSummary {
  originalFilename: string;
  mimeType: string;
  outputs: VideoOutput[];
  processingHistory: ProcessingHistoryEntry[];
}

export interface VideoOutput {
  resolution: VideoResolution;
  width: number;
  height: number;
  bitrate: number;
  fileSize?: number;
  status: VideoStatus;
  playlistUrl: string;
}

export interface ProcessingHistoryEntry {
  status: VideoStatus;
  timestamp: string;
}

export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type VideoResolution = '480p' | '720p' | '1080p';
