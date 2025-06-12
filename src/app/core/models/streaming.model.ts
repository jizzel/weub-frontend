import {VideoResolution} from './video.model';

export interface StreamingQuality {
  resolution: VideoResolution;
  width: number;
  height: number;
  bitrate: number;
  playlistUrl: string;
}

export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentQuality?: VideoResolution;
  availableQualities: StreamingQuality[];
  playbackRate: number;
  isFullscreen: boolean;
  error?: string;
}

export interface PlayerConfig {
  autoplay: boolean;
  controls: boolean;
  muted: boolean;
  loop: boolean;
  preload: 'none' | 'metadata' | 'auto';
  volume: number;
  playbackRates: number[];
  defaultQuality?: VideoResolution;
}
