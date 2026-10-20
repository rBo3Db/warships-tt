import type { Vehicle } from '../../../types/vehicle';
import { useI18n } from '../../../context';
import { TechTree } from '../../TechTree/TechTree';
import styles from '../Encyclopedia.module.css';

export interface TechTreeSectionProps {
  selectedNation: string | null;
  nationShips: Vehicle[];
  searchQuery: string;
  matchingShipIds: Set<string>;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

export function TechTreeSection({
  selectedNation,
  nationShips,
  searchQuery,
  matchingShipIds,
  isLoading,
  errorMessage,
  onRetry,
}: TechTreeSectionProps) {
  const { ui } = useI18n();

  if (!selectedNation) {
    return <div className={styles.empty}>{ui.selectNationForTree}</div>;
  }

  if (nationShips.length === 0 && !isLoading && !errorMessage) {
    return <div className={styles.empty}>{ui.noShips}</div>;
  }

  return (
    <TechTree
      nationShips={nationShips}
      searchQuery={searchQuery}
      matchingShipIds={matchingShipIds}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={onRetry}
    />
  );
}

export default TechTreeSection;
