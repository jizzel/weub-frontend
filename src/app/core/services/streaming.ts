import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PlayerConfig, PlayerState, StreamingQuality} from '../models/streaming.model';

@Injectable({
  providedIn: 'root'
})
export class Streaming {
  private playerStateSubject = new BehaviorSubject<PlayerState>({
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    availableQualities: [],
    playbackRate: 1,
    isFullscreen: false
  });

  private playerConfigSubject = new BehaviorSubject<PlayerConfig>({
    autoplay: false,
    controls: true,
    muted: false,
    loop: false,
    preload: 'metadata',
    volume: 1,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    defaultQuality: '720p'
  });

  public playerState$ = this.playerStateSubject.asObservable();
  public playerConfig$ = this.playerConfigSubject.asObservable();

  // Update player state
  updatePlayerState(state: Partial<PlayerState>): void {
    const currentState = this.playerStateSubject.value;
    this.playerStateSubject.next({ ...currentState, ...state });
  }

  // Update player configuration
  updatePlayerConfig(config: Partial<PlayerConfig>): void {
    const currentConfig = this.playerConfigSubject.value;
    this.playerConfigSubject.next({ ...currentConfig, ...config });
  }

  // Get current player state
  getCurrentState(): PlayerState {
    return this.playerStateSubject.value;
  }

  // Get current player config
  getCurrentConfig(): PlayerConfig {
    return this.playerConfigSubject.value;
  }

  // Reset player state
  resetPlayerState(): void {
    this.playerStateSubject.next({
      isPlaying: false,
      isPaused: false,
      isBuffering: false,
      currentTime: 0,
      duration: 0,
      volume: this.playerStateSubject.value.volume,
      isMuted: this.playerStateSubject.value.isMuted,
      availableQualities: [],
      playbackRate: 1,
      isFullscreen: false
    });
  }

  // Generate quality options from video outputs
  generateQualityOptions(streamingUrls: Record<string, string>): StreamingQuality[] {
    return Object.entries(streamingUrls).map(([resolution, url]) => {
      const [height] = resolution.match(/\d+/) || ['720'];
      const heightNum = parseInt(height, 10);

      return {
        resolution: resolution as any,
        width: this.getWidthFromHeight(heightNum),
        height: heightNum,
        bitrate: this.getBitrateFromHeight(heightNum),
        playlistUrl: url
      };
    });
  }

  private getWidthFromHeight(height: number): number {
    const aspectRatio = 16 / 9;
    return Math.round(height * aspectRatio);
  }

  private getBitrateFromHeight(height: number): number {
    const bitrateMap: Record<number, number> = {
      480: 1500,
      720: 3000,
      1080: 5000
    };
    return bitrateMap[height] || 3000;
  }
}
