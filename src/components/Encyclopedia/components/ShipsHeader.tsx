import { useI18n } from '../../../context';
import { ViewMode } from '../../../types/vehicle';
import styles from '../Encyclopedia.module.css';

export { ViewMode };

export interface ShipsHeaderProps {
  title: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  count: number;
}

export function ShipsHeader({
  title,
  viewMode,
  onViewModeChange,
  count,
}: ShipsHeaderProps) {
  const { ui } = useI18n();

  return (
    <div className={styles.shipsHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.viewSwitcher}>
        <button
          type="button"
          className={`${styles.item} ${viewMode === ViewMode.GRID ? styles.itemSelected : ''}`}
          onClick={() => onViewModeChange(ViewMode.GRID)}
        >
          {ui.viewGrid}
        </button>
        <button
          type="button"
          className={`${styles.item} ${viewMode === ViewMode.TREE ? styles.itemSelected : ''}`}
          onClick={() => onViewModeChange(ViewMode.TREE)}
        >
          {ui.viewTree}
        </button>
        <span className={styles.count}>({count})</span>
      </div>
    </div>
  );
}

export default ShipsHeader;
