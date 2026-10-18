import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
}

export function ErrorBanner({
  message,
  retryLabel,
  onRetry,
  dismissLabel,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <aside className={styles.banner} role="alert">
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">⚠️</span>
        <span className={styles.message}>{message}</span>
      </div>
      <div className={styles.actions}>
        {onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            {retryLabel || 'Retry'}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={onDismiss}
            title={dismissLabel || 'Dismiss'}
            aria-label={dismissLabel || 'Dismiss'}
          >
            ✕
          </button>
        )}
      </div>
    </aside>
  );
}

export default ErrorBanner;
