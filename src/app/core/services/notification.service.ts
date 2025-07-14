import { Injectable } from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {Notification, NotificationAction} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private defaultDurations = {
    success: 5000,
    info: 5000,
    warning: 8000,
    error: 10000
  };

  // Show notification
  show(
    type: Notification['type'],
    title: string,
    message: string,
    duration?: number,
    actions?: NotificationAction[],
    persistent = false
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDurations[type],
      actions,
      timestamp: new Date(),
      persistent
    };

    this.addNotification(notification);

    if (!persistent && notification.duration) {
      timer(notification.duration).subscribe(() => {
        this.dismiss(notification.id);
      });
    }

    return notification.id;
  }

  // Show success notification
  success(title: string, message: string, duration?: number): string {
    return this.show('success', title, message, duration);
  }

  // Show error notification
  error(title: string, message: string, persistent = false): string {
    return this.show('error', title, message, undefined, undefined, persistent);
  }

  // Show warning notification
  warning(title: string, message: string, duration?: number): string {
    return this.show('warning', title, message, duration);
  }

  // Show info notification
  info(title: string, message: string, duration?: number): string {
    return this.show('info', title, message, duration);
  }

  // Dismiss notification
  dismiss(id: string): void {
    const notifications = this.notificationsSubject.value;
    const filtered = notifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
  }

  // Dismiss all notifications
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  // Get current notifications
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  private addNotification(notification: Notification): void {
    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...notifications, notification]);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
