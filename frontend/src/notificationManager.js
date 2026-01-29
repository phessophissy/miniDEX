// Notification manager

export class NotificationManager {
  constructor() {
    this.notifications = [];
  }

  notify(message, type = 'info', duration = 5000) {
    const notification = {
      id: Math.random().toString(36),
      message,
      type,
      timestamp: Date.now()
    };

    this.notifications.push(notification);

    if (duration) {
      setTimeout(() => this.remove(notification.id), duration);
    }

    return notification;
  }

  success(message, duration) {
    return this.notify(message, 'success', duration);
  }

  error(message, duration) {
    return this.notify(message, 'error', duration);
  }

  warning(message, duration) {
    return this.notify(message, 'warning', duration);
  }

  info(message, duration) {
    return this.notify(message, 'info', duration);
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getAll() {
    return this.notifications;
  }

  clear() {
    this.notifications = [];
  }
}

export const notificationManager = new NotificationManager();
