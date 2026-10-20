import { useState, useRef, useMemo } from 'react';
import { type Vehicle, ShipStatus, ShipSortOption, ViewMode } from '../../types/vehicle';
import { useI18n, useConfig } from '../../context';
import { useShipsFilter } from './hooks/useShipsFilter';
import { useVehicles } from './hooks/useVehicles';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { Header } from '../Header';
import { NationsBar } from '../NationsBar';
import { Catalog, CatalogToolbar } from '../Catalog';
import { ShipsHeader } from './components/ShipsHeader';
import { TechTreeSection } from './components/TechTreeSection';
import { ScrollToTop } from '../ui/ScrollToTop';
import { ErrorBanner } from '../ui/ErrorBanner';
import styles from './Encyclopedia.module.css';

export function Encyclopedia() {
  const { lang, ui } = useI18n();
  const { getNation, getFlagUrl } = useConfig();
  const {
    vehicles,
    isLoading: isVehiclesLoading,
    vehiclesError,
    bannerError,
    retryVehicles,
    dismissBanner,
  } = useVehicles();

  const safeVehicles = useMemo(() => vehicles || [], [vehicles]);

  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ShipStatus>(ShipStatus.ALL);
  const [selectedSort, setSelectedSort] = useState<ShipSortOption>(ShipSortOption.TIER_ASC);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [searchQuery, setSearchQuery] = useState('');

  const shipsSectionRef = useRef<HTMLDivElement>(null);

  const selectedNationObj = selectedNation ? getNation(selectedNation) : null;
  const flagUrl = selectedNationObj
    ? getFlagUrl(selectedNationObj.icons.large || selectedNationObj.icons.default) || null
    : null;

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
    selectedSort,
    searchQuery,
    selectedLang: lang,
  });


  // Incremental chunk loading for catalog
  const {
    visibleItems: visibleCatalogShips,
    displayLimit,
    loadMoreRef,
  } = useInfiniteScroll({
    items: filteredCatalogShips,
    chunkSize: 36,
    resetDeps: [selectedNation, selectedType, selectedTier, selectedStatus, selectedSort, searchQuery],
  });

  const handleSelectNation = (nationName: string | null) => {
    setSelectedNation((prev) => (prev === nationName ? null : nationName));
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJumpToOtherNationShip = (ship: Vehicle) => {
    setSelectedNation(ship.nation);
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      {/* Ambient large flag background across all empty space */}
      {flagUrl && (
        <div
          className={styles.nationWatermark}
          style={{ backgroundImage: `url("${flagUrl}")` }}
          aria-hidden="true"
        />
      )}

      {/* Header with Search and Language Picker - spans 100% full width */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        otherNationMatches={otherNationMatches}
        onJumpToShip={handleJumpToOtherNationShip}
      />

      <div className={styles.container}>
        {/* Warning banner when background sync failed but cached data is displayed */}
        {bannerError && (
          <ErrorBanner
            message={bannerError}
            retryLabel={ui.retry}
            onRetry={retryVehicles}
            dismissLabel={ui.dismiss}
            onDismiss={dismissBanner}
          />
        )}

        <div className={styles.mainLayout}>
          {/* Nations sidebar on the left */}
          <aside className={styles.sidebarWrapper}>
            <NationsBar
              selectedNation={selectedNation}
              onSelectNation={handleSelectNation}
            />
          </aside>

          {/* View Switcher (Catalog / Tree) and Section Title */}
          <section ref={shipsSectionRef} className={styles.contentSection}>
            <ShipsHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              count={searchQuery ? matchingShipIds.size : filteredCatalogShips.length}
            />

            {viewMode === ViewMode.TREE ? (
              <TechTreeSection
                selectedNation={selectedNation}
                nationShips={currentNationShips}
                searchQuery={searchQuery}
                matchingShipIds={matchingShipIds}
                isLoading={isVehiclesLoading}
                errorMessage={vehiclesError}
                onRetry={retryVehicles}
              />
            ) : (
              <>
                <CatalogToolbar
                  selectedType={selectedType}
                  onSelectType={setSelectedType}
                  selectedStatus={selectedStatus}
                  onSelectStatus={setSelectedStatus}
                  selectedTier={selectedTier}
                  onSelectTier={setSelectedTier}
                  selectedSort={selectedSort}
                  onSelectSort={setSelectedSort}
                />
                <Catalog
                  ships={visibleCatalogShips}
                  totalFilteredCount={filteredCatalogShips.length}
                  displayLimit={displayLimit}
                  loadMoreRef={loadMoreRef}
                  isLoading={isVehiclesLoading}
                  errorMessage={vehiclesError}
                  onRetry={retryVehicles}
                />
              </>
            )}
          </section>
        </div>

        {/* Floating Scroll to Top Button */}
        <ScrollToTop label={ui.scrollToTop} threshold={400} />
      </div>
    </div>
  );
}

export default Encyclopedia;
