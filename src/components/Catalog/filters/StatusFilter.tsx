import { useI18n } from '../../../context';
import { ShipStatus } from '../../../types/vehicle';
import styles from '../Catalog.module.css';

export interface StatusFilterProps {
  selectedStatus: ShipStatus;
  onSelectStatus: (status: ShipStatus) => void;
}

export function StatusFilter({ selectedStatus, onSelectStatus }: StatusFilterProps) {
  const { ui } = useI18n();

  return (
    <div className={styles.list}>
      <button
        type="button"
        className={`${styles.item} ${selectedStatus === ShipStatus.RESEARCHABLE ? styles.itemSelected : ''}`}
        onClick={() =>
          onSelectStatus(
            selectedStatus === ShipStatus.RESEARCHABLE ? ShipStatus.ALL : ShipStatus.RESEARCHABLE
          )
        }
      >
        {ui.onlyResearchable}
      </button>
      <button
        type="button"
        className={`${styles.item} ${selectedStatus === ShipStatus.PREMIUM ? styles.itemSelected : ''}`}
        onClick={() =>
          onSelectStatus(
            selectedStatus === ShipStatus.PREMIUM ? ShipStatus.ALL : ShipStatus.PREMIUM
          )
        }
      >
        {ui.onlyPremium}
      </button>
    </div>
  );
}

export default StatusFilter;
