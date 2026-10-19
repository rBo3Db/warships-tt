import { useI18n } from '../../../context';
import styles from './ShipImage.module.css';

export interface ShipImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackClassName?: string;
}

export function ShipImage({
  src,
  alt,
  className,
  fallbackText,
  fallbackClassName,
}: ShipImageProps) {
  const { ui } = useI18n();

  if (!src) {
    return (
      <div className={fallbackClassName || styles.empty}>
        {fallbackText ?? ui.noImage}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || styles.shipImage}
      loading="lazy"
    />
  );
}

export default ShipImage;
