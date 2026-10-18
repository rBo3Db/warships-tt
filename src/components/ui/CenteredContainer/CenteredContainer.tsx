import type { FC, ReactNode } from 'react';
import styles from './CenteredContainer.module.css';

export interface CenteredContainerProps {
  children: ReactNode;
  /** 'screen' = 100vh, 'section' = 400px (defaults to 'screen') */
  minHeight?: 'screen' | 'section';
  className?: string;
}

export const CenteredContainer: FC<CenteredContainerProps> = ({
  children,
  minHeight = 'screen',
  className = '',
}) => {
  const minHeightClass = styles[minHeight] || styles.screen;

  return (
    <div className={`${styles.container} ${minHeightClass} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default CenteredContainer;
