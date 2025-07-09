export const environment = {
  production: true,
  apiUrl: 'https://api.weub.com/v1',
  appName: 'Weub',
  version: '1.0.0',
  features: {
    uploadEnabled: true,
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    supportedFormats: ['mp4', 'mov', 'webm', 'avi'],
    maxConcurrentUploads: 3,
    enableAnalytics: true,
    enableServiceWorker: true,
  },
  video: {
    defaultQuality: '720p',
    supportedResolutions: ['480p', '720p', '1080p'],
    hlsConfig: {
      enableWorker: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 0.5,
    },
  },
  ui: {
    theme: 'light',
    itemsPerPage: 20,
    maxItemsPerPage: 100,
    enableDarkMode: true,
    animations: true,
  },
  polling: {
    statusInterval: 10000, // 10 seconds
    maxRetries: 5,
    retryDelay: 2000,
    baseDelay: 1000,
    maxDelay: 30000

  },
  logging: {
    level: 'error',
    enableConsoleLog: false,
    enableErrorReporting: true,
  }
};
