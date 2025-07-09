export interface UploadRequest {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
}

export interface UploadProgress {
  id: string;
  filename: string;
  size: number;
  uploaded: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  estimatedTimeRemaining?: number;
  speed?: number;
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
