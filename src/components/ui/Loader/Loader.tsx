import type { FC } from 'react';
import styles from './Loader.module.css';

export interface LoaderProps {
  /** Текст под спиннером (по умолчанию "Загрузка...") */
  text?: string;
  /** Размер спиннера */
  size?: 'sm' | 'md' | 'lg';
  /** Растянуть на весь экран или контейнер по центру */
  fullScreen?: boolean;
}

export const Loader: FC<LoaderProps> = ({
  text,
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClass = styles[size] || styles.md;
  const fullScreenClass = fullScreen ? styles.fullscreen : '';

  return (
    <div className={`${styles.loader} ${sizeClass} ${fullScreenClass}`}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};
