import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import {Video} from '../services/video';

/**
 * Guard to ensure video is ready for playback before allowing access to video player route
 */
export const videoReadyGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const { videoId, videoService, router, notificationService } = getRequiredServicesAndVideoId(route)

  if (!videoId) {
    notificationService.error('Invalid video ID', 'The video ID is missing or invalid.');
    router.navigate(['/']);
    return of(false);
  }

  return videoService.getVideo(videoId).pipe(
    switchMap(video => {
      switch (video.status) {
        case 'ready':
          return of(true);

        case 'processing':
          notificationService.warning(
            'Video Still Processing',
            'This video is still being processed. Please wait a moment and try again.'
          );
          router.navigate(['/video', videoId, 'status']);
          return of(false);

        case 'pending':
          notificationService.info(
            'Video Queued',
            'This video is queued for processing. Please check back later.'
          );
          router.navigate(['/video', videoId, 'status']);
          return of(false);

        case 'failed':
          notificationService.error(
            'Processing Failed',
            'This video failed to process and cannot be played.'
          );
          router.navigate(['/']);
          return of(false);

        default:
          notificationService.error(
            'Unknown Status',
            'This video has an unknown status and cannot be played.'
          );
          router.navigate(['/']);
          return of(false);
      }
    }),
    catchError(error => {
      console.error('Error checking video status:', error);
      notificationService.error(
        'Video Not Found',
        'The requested video could not be found.'
      );
      router.navigate(['/']);
      return of(false);
    })
  );
};

/**
 * Guard to check if video exists before allowing access to any video-related route
 */
export const videoExistsGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const { videoId, videoService, router, notificationService } = getRequiredServicesAndVideoId(route)

  if (!videoId) {
    notificationService.error('Invalid video ID', 'The video ID is missing or invalid.');
    router.navigate(['/']);
    return of(false);
  }

  return videoService.getVideo(videoId).pipe(
    map(() => true),
    catchError(error => {
      console.error('Video not found:', error);
      notificationService.error(
        'Video Not Found',
        'The requested video could not be found.'
      );
      router.navigate(['/']);
      return of(false);
    })
  );
};

/**
 * Guard to prevent access to processing status page for ready videos
 */
export const videoProcessingGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const { videoId, videoService, router, notificationService } = getRequiredServicesAndVideoId(route)

  if (!videoId) {
    notificationService.error('Invalid video ID', 'The video ID is missing or invalid.');
    router.navigate(['/']);
    return of(false);
  }

  return videoService.getVideo(videoId).pipe(
    map(video => {
      if (video.status === 'ready') {
        // Redirect to player if video is ready
        router.navigate(['/video', videoId, 'watch']);
        return false;
      }
      return true;
    }),
    catchError(error => {
      console.error('Error checking video status:', error);
      notificationService.error(
        'Video Not Found',
        'The requested video could not be found.'
      );
      router.navigate(['/']);
      return of(false);
    })
  );
};

/**
 * Guard to check if video has available resolutions for streaming
 */
export const videoStreamableGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const { videoId, videoService, router, notificationService } = getRequiredServicesAndVideoId(route)

  if (!videoId) {
    notificationService.error('Invalid video ID', 'The video ID is missing or invalid.');
    router.navigate(['/']);
    return of(false);
  }

  return videoService.getVideo(videoId).pipe(
    map(video => {
      if (video.status !== 'ready') {
        router.navigate(['/video', videoId, 'status']);
        return false;
      }

      if (!video.availableResolutions || video.availableResolutions.length === 0) {
        notificationService.error(
          'No Streaming Quality Available',
          'This video has no available streaming qualities.'
        );
        router.navigate(['/video', videoId]);
        return false;
      }

      return true;
    }),
    catchError(error => {
      console.error('Error checking video streamability:', error);
      notificationService.error(
        'Video Not Found',
        'The requested video could not be found.'
      );
      router.navigate(['/']);
      return of(false);
    })
  );
};

/**
 * Helper function to validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Guard to validate video ID format
 */
export const validVideoIdGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean => {
  const { videoId, router, notificationService } = getRequiredServicesAndVideoId(route)

  if (!videoId || !isValidUUID(videoId)) {
    notificationService.error('Invalid Video ID', 'The video ID format is invalid.');
    router.navigate(['/']);
    return false;
  }

  return true;
};

function getRequiredServicesAndVideoId(route: ActivatedRouteSnapshot): {
  videoId: string | null;
  videoService: Video;
  router: Router;
  notificationService: NotificationService;
} {
  const videoService = inject(Video);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const videoId = route.paramMap.get('id');
  return { videoId, videoService, router, notificationService };
}
