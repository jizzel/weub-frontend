export const API_ENDPOINTS = {
  VIDEOS: {
    BASE: 'videos',
    UPLOAD: 'videos/upload',
    LIST: 'videos',
    DETAIL: (id: string) => `videos/${id}`,
    STATUS: (id: string) => `videos/${id}/status`,
    THUMBNAIL: (id: string) => `videos/${id}/thumbnail`,
  },
  STREAMING: {
    HLS_PLAYLIST: (videoId: string, resolution: string) =>
      `stream/${videoId}/${resolution}/playlist.m3u8`,
    HLS_SEGMENT: (videoId: string, resolution: string, segment: string) =>
      `stream/${videoId}/${resolution}/${segment}`,
  },
  SYSTEM: {
    HEALTH: 'health',
    STATS: 'stats',
  }
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  // Video errors
  VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  STREAMING_ERROR: 'STREAMING_ERROR',

  // System errors
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_UUID: 'INVALID_UUID',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  HLS_PLAYLIST: 'application/vnd.apple.mpegurl',
  VIDEO_SEGMENT: 'video/mp2t',
  IMAGE_JPEG: 'image/jpeg',
} as const;
