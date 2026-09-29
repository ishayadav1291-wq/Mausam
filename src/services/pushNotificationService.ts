// Push Notification Manager for IMD Severe Weather and Critical Alerts

export interface CriticalAlertPayload {
  id?: string;
  title: string;
  message: string;
  severity?: 'red' | 'orange' | string;
  category?: string;
  issuedAt?: string;
  url?: string;
}

type AlertListener = (alert: CriticalAlertPayload) => void;

const STORAGE_KEY_ENABLED = 'mausam_push_notifications_enabled';
const STORAGE_KEY_THRESHOLD = 'mausam_push_severity_threshold';

const listeners: Set<AlertListener> = new Set();

export const PushNotificationManager = {
  isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to true so users receive warnings right away
    return true;
  },

  setEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
  },

  getSeverityThreshold(): 'red' | 'orange' {
    if (typeof window === 'undefined') return 'orange';
    const stored = localStorage.getItem(STORAGE_KEY_THRESHOLD);
    return stored === 'red' ? 'red' : 'orange';
  },

  setSeverityThreshold(threshold: 'red' | 'orange'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_THRESHOLD, threshold);
  },

  isInIframe(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  },

  getNativeStatus(): 'granted' | 'denied' | 'default' | 'iframe_restricted' | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    if (this.isInIframe()) {
      return Notification.permission === 'granted' ? 'granted' : 'iframe_restricted';
    }
    return Notification.permission;
  },

  subscribe(listener: AlertListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    // Always enable in-app broadcast
    this.setEnabled(true);

    if (!('Notification' in window)) {
      return true;
    }

    if (this.isInIframe()) {
      // In cross-origin iframes, Notification.requestPermission() throws or is disallowed by browser
      // Still enable in-app notifications
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Browser restricted Notification.requestPermission():', err);
      // In-app alert system is still active
      return true;
    }
  },

  async sendCriticalAlert(payload: CriticalAlertPayload): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    // Check threshold filter
    const threshold = this.getSeverityThreshold();
    if (threshold === 'red' && payload.severity !== 'red') {
      return false;
    }

    const alertWithId: CriticalAlertPayload = {
      ...payload,
      id: payload.id || `alert-${Date.now()}`,
      issuedAt: payload.issuedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Dispatch silently to all active in-app listeners (toasts, alert banners, popups)
    listeners.forEach((fn) => {
      try {
        fn(alertWithId);
      } catch (e) {
        console.error('Error invoking alert listener:', e);
      }
    });

    // 3. Attempt native browser notification if available
    let nativeDelivered = false;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            if (registration && 'showNotification' in registration) {
              await registration.showNotification(payload.title, {
                body: payload.message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚠️</text></svg>',
                tag: 'imd-critical-alert',
                data: {
                  url: payload.url || window.location.href,
                  severity: payload.severity
                }
              });
              nativeDelivered = true;
            }
          }

          if (!nativeDelivered) {
            new Notification(payload.title, {
              body: payload.message,
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚠️</text></svg>',
              tag: 'imd-critical-alert'
            });
            nativeDelivered = true;
          }
        }
      } catch (err) {
        // Native notification couldn't be displayed, in-app alert was successfully shown
        console.warn('Native notification suppressed by browser/iframe:', err);
      }
    }

    return true;
  },

  async sendTestNotification(): Promise<boolean> {
    return this.sendCriticalAlert({
      title: '🚨 Severe Weather Alert (IMD)',
      message: 'Test Broadcast: Heavy precipitation & high wind speed alert for your selected region. Emergency shelter advisory in effect.',
      severity: this.getSeverityThreshold(),
      category: 'cyclone',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
};
