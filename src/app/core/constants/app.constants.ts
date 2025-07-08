export const APP_CONFIG = {
  NAME: 'Weub',
  VERSION: '1.0.0',
  DESCRIPTION: 'A minimal video streaming application',
  AUTHOR: 'Weub Team',
  CONTACT_EMAIL: 'support@weub.com',
} as const;

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  VIDEO_LIST: '/videos',
  VIDEO_DETAIL: '/video/:id',
  VIDEO_WATCH: '/video/:id/watch',
  VIDEO_STATUS: '/video/:id/status',
  SYSTEM_STATS: '/stats',
  NOT_FOUND: '/404',
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'weub_user_preferences',
  PLAYER_SETTINGS: 'weub_player_settings',
  RECENT_UPLOADS: 'weub_recent_uploads',
  THEME: 'weub_theme',
  VOLUME: 'weub_volume',
  PLAYBACK_RATE: 'weub_playback_rate',
  LAST_VISITED: 'weub_last_visited',
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;
