import styles from './Loader.module.css';

export interface LoaderProps {
  className?: string;
  'aria-label'?: string;
}

export function Loader({
  className = '',
  'aria-label': ariaLabel = 'Loading',
}: LoaderProps) {
  return (
    <div
      className={`${styles.loader} ${className}`.trim()}
      role="status"
      aria-label={ariaLabel}
    >
      <div className={styles.spinner} />
    </div>
  );
}

export default Loader;
