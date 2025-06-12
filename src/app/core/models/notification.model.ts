export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: Date;
  persistent?: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
}
