import styles from './ErrorCard.module.css';

interface ErrorCardProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  title,
  message,
  retryLabel = 'Try Again',
  onRetry,
}: ErrorCardProps) {
  return (
    <div className={styles.card} role="alert">
      <div className={styles.icon} aria-hidden="true">📡</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default ErrorCard;
