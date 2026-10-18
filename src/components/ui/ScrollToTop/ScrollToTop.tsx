import { useState, useEffect } from 'react';
import styles from './ScrollToTop.module.css';

interface ScrollToTopProps {
  label?: string;
  threshold?: number;
}

export function ScrollToTop({ label = 'Scroll to top', threshold = 400 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.scrollTopBtn}
      onClick={handleScrollToTop}
      title={label}
      aria-label={label}
    >
      ▲
    </button>
  );
}

export default ScrollToTop;
