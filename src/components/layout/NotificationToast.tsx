'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import styles from './NotificationToast.module.css';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// NotificationToast — auto-dismissing toasts rendered at bottom-right
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.container} role="region" aria-label="Notifications" aria-live="polite">
      {notifications.map((notif) => {
        const Icon = ICONS[notif.type];
        return (
          <div
            key={notif.id}
            className={cn(styles.toast, styles[`toast--${notif.type}`])}
            role="alert"
          >
            <span className={styles.icon} aria-hidden="true"><Icon size={18} /></span>
            <div className={styles.body}>
              <p className={styles.title}>{notif.title}</p>
              {notif.message && <p className={styles.message}>{notif.message}</p>}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => removeNotification(notif.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;
