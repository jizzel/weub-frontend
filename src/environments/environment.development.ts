export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  appName: 'Weub',
  version: '1.0.0',
  features: {
    uploadEnabled: true,
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    supportedFormats: ['mp4', 'mov', 'webm', 'avi'],
    maxConcurrentUploads: 3,
    enableAnalytics: false,
    enableServiceWorker: false,
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
    statusInterval: 5000, // 5 seconds
    maxRetries: 3,
    retryDelay: 1000,
    baseDelay: 1000,
    maxDelay: 30000
  },
  logging: {
    level: 'debug',
    enableConsoleLog: true,
    enableErrorReporting: false,
  }
};
