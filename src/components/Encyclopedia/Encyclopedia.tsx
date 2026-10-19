import { useState, useRef, useMemo, useEffect } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { useShipsFilter } from '../../hooks/useShipsFilter';
import { Header } from '../Header';
import { NationsBar } from '../NationsBar';
import { Catalog } from '../Catalog';
import { TechTree } from '../TechTree/TechTree';
import { ScrollToTop } from '../ui/ScrollToTop';
import { ErrorBanner } from '../ui/ErrorBanner';
import styles from './Encyclopedia.module.css';

export interface EncyclopediaProps {
  vehicles: Vehicle[] | null;
  bannerError?: string | null;
  onRetryBanner?: () => void;
  onDismissBanner?: () => void;
  vehiclesError?: string | null;
  onRetryVehicles?: () => void;
}

export function Encyclopedia({
  vehicles,
  bannerError = null,
  onRetryBanner,
  onDismissBanner,
  vehiclesError = null,
  onRetryVehicles,
}: EncyclopediaProps) {
  const { lang, ui } = useI18n();
  const { nations, getNation } = useConfig();

  const isVehiclesLoading = vehicles === null;
  const safeVehicles = useMemo(() => vehicles || [], [vehicles]);

  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'researchable' | 'premium'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const CHUNK_SIZE = 36;
  const [displayLimit, setDisplayLimit] = useState(CHUNK_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const shipsSectionRef = useRef<HTMLDivElement>(null);

  // Hook for filtering ships across all dimensions
  const {
    currentNationShips,
    matchingShipIds,
    otherNationMatches,
    filteredCatalogShips,
  } = useShipsFilter({
    vehicles: safeVehicles,
    selectedNation,
    selectedType,
    selectedTier,
    selectedStatus,
    searchQuery,
    selectedLang: lang,
  });

  // Current section title
  const currentNationTitle = useMemo(() => {
    if (!selectedNation) return ui.allNations;
    const currentNationObj = getNation(selectedNation);
    return (
      currentNationObj?.localization?.mark?.[lang] ||
      currentNationObj?.name ||
      selectedNation
    );
  }, [selectedNation, getNation, lang, ui.allNations]);

  // Reset display limit when filter, nation, tier, status or search changes
  useEffect(() => {
    setDisplayLimit(CHUNK_SIZE);
  }, [selectedNation, selectedType, selectedTier, selectedStatus, searchQuery]);

  // Infinite scroll observer: loads next chunk when scrolling near bottom
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDisplayLimit((prev) => {
            if (prev < filteredCatalogShips.length) {
              return Math.min(prev + CHUNK_SIZE, filteredCatalogShips.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredCatalogShips.length]);

  const visibleCatalogShips = useMemo(() => {
    return filteredCatalogShips.slice(0, displayLimit);
  }, [filteredCatalogShips, displayLimit]);

  const handleSelectNation = (nationName: string | null) => {
    setSelectedNation((prev) => (prev === nationName ? null : nationName));
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJumpToOtherNationShip = (ship: Vehicle) => {
    setSelectedNation(ship.nation);
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.container}>
      {/* Warning banner when background sync failed but cached data is displayed */}
      {bannerError && (
        <ErrorBanner
          message={bannerError}
          retryLabel={ui.retry}
          onRetry={onRetryBanner}
          dismissLabel={ui.dismiss}
          onDismiss={onDismissBanner}
        />
      )}

      {/* Header with Search and Language Picker */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        otherNationMatches={otherNationMatches}
        onJumpToShip={handleJumpToOtherNationShip}
      />

      {/* Nations horizontal list */}
      <NationsBar
        selectedNation={selectedNation}
        onSelectNation={handleSelectNation}
      />

      {/* View Switcher (Catalog / Tree) and Section Title */}
      <section ref={shipsSectionRef} className={styles.section}>
        <div className={styles.shipsHeader}>
          <h2 className={styles.sectionTitle}>{currentNationTitle}</h2>
          <div className={styles.viewSwitcher}>
            <button
              type="button"
              className={`${styles.item} ${viewMode === 'grid' ? styles.itemSelected : ''}`}
              onClick={() => setViewMode('grid')}
            >
              {ui.viewGrid}
            </button>
            <button
              type="button"
              className={`${styles.item} ${viewMode === 'tree' ? styles.itemSelected : ''}`}
              onClick={() => setViewMode('tree')}
            >
              {ui.viewTree}
            </button>
            <span className={styles.count}>
              ({searchQuery ? matchingShipIds.size : filteredCatalogShips.length})
            </span>
          </div>
        </div>

        {viewMode === 'tree' ? (
          /* Tree View */
          !selectedNation ? (
            <div className={styles.empty}>{ui.selectNationForTree}</div>
          ) : currentNationShips.length === 0 && !isVehiclesLoading && !vehiclesError ? (
            <div className={styles.empty}>{ui.noShips}</div>
          ) : (
            <TechTree
              nationShips={currentNationShips}
              searchQuery={searchQuery}
              matchingShipIds={matchingShipIds}
              isLoading={isVehiclesLoading}
              errorMessage={vehiclesError}
              onRetry={onRetryVehicles}
            />
          )
        ) : (
          /* Catalog View */
          <Catalog
            ships={visibleCatalogShips}
            totalFilteredCount={filteredCatalogShips.length}
            displayLimit={displayLimit}
            loadMoreRef={loadMoreRef}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            isLoading={isVehiclesLoading}
            errorMessage={vehiclesError}
            onRetry={onRetryVehicles}
          />
        )}
      </section>

      {/* Floating Scroll to Top Button */}
      <ScrollToTop label={ui.scrollToTop} threshold={400} />
    </div>
  );
}

export default Encyclopedia;
