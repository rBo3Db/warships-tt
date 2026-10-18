import { useState, useRef, useMemo, useEffect } from 'react';
import type { Nation } from '../../types/nation';
import type { Vehicle, VehicleTypesMap } from '../../types/vehicle';
import { getUiTranslation } from '../../utils/i18n';
import { useShipsFilter } from '../../hooks/useShipsFilter';
import { Header } from '../Header';
import { NationsBar } from '../NationsBar';
import { Catalog } from '../Catalog';
import { TechTree } from '../TechTree/TechTree';
import { ScrollToTop } from '../ui/ScrollToTop';
import styles from './Encyclopedia.module.css';

interface EncyclopediaProps {
  nations: Nation[] | null;
  mediaPath: string | null;
  vehicleTypes: VehicleTypesMap | null;
  vehicles: Vehicle[] | null;
}

export function Encyclopedia({
  nations,
  mediaPath,
  vehicleTypes,
  vehicles,
}: EncyclopediaProps) {
  const safeNations = useMemo(() => nations || [], [nations]);
  const safeMediaPath = mediaPath || '';
  const safeVehicleTypes = useMemo(() => vehicleTypes || {}, [vehicleTypes]);
  const isVehiclesLoading = vehicles === null;
  const safeVehicles = useMemo(() => vehicles || [], [vehicles]);

  // Available language codes from nations data
  const languages = useMemo(() => {
    const list = Array.from(
      new Set(safeNations.flatMap((n) => Object.keys(n.localization?.mark || {})))
    );
    return list.length > 0 ? list : ['en', 'ru'];
  }, [safeNations]);

  const [selectedLang, setSelectedLang] = useState<string>(() => {
    if (typeof navigator !== 'undefined') {
      const raw = navigator.language.toLowerCase().replace('-', '_');
      if (languages.includes(raw)) return raw;
      const base = raw.split('_')[0];
      if (languages.includes(base)) return base;
    }
    return languages.includes('en') ? 'en' : languages[0] || 'en';
  });

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

  // Current localized UI strings
  const ui = useMemo(() => getUiTranslation(selectedLang), [selectedLang]);

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
    selectedLang,
  });

  // Sorted ship types by sort_order
  const sortedTypes = useMemo(() => {
    return Object.entries(safeVehicleTypes).sort(
      ([, a], [, b]) => a.sort_order - b.sort_order
    );
  }, [safeVehicleTypes]);

  // Current section title
  const currentNationTitle = useMemo(() => {
    if (!selectedNation) return ui.allNations;
    const currentNationObj = safeNations.find((n) => n.name === selectedNation);
    return (
      currentNationObj?.localization?.mark?.[selectedLang] ||
      currentNationObj?.name ||
      selectedNation
    );
  }, [selectedNation, safeNations, selectedLang, ui.allNations]);

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
      {/* Header with Search and Language Picker */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
        languages={languages}
        ui={ui}
        otherNationMatches={otherNationMatches}
        nations={safeNations}
        mediaPath={safeMediaPath}
        onJumpToShip={handleJumpToOtherNationShip}
      />

      {/* Nations horizontal list */}
      <NationsBar
        nations={safeNations}
        selectedNation={selectedNation}
        onSelectNation={handleSelectNation}
        mediaPath={safeMediaPath}
        selectedLang={selectedLang}
        ui={ui}
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
          ) : currentNationShips.length === 0 && !isVehiclesLoading ? (
            <div className={styles.empty}>{ui.noShips}</div>
          ) : (
            <TechTree
              nationShips={currentNationShips}
              selectedLang={selectedLang}
              mediaPath={safeMediaPath}
              vehicleTypes={safeVehicleTypes}
              ui={ui}
              searchQuery={searchQuery}
              matchingShipIds={matchingShipIds}
              isLoading={isVehiclesLoading}
            />
          )
        ) : (
          /* Catalog View */
          <Catalog
            ships={visibleCatalogShips}
            totalFilteredCount={filteredCatalogShips.length}
            displayLimit={displayLimit}
            loadMoreRef={loadMoreRef}
            sortedTypes={sortedTypes}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            selectedLang={selectedLang}
            mediaPath={safeMediaPath}
            vehicleTypes={safeVehicleTypes}
            nations={safeNations}
            ui={ui}
            isLoading={isVehiclesLoading}
          />
        )}
      </section>

      {/* Floating Scroll to Top Button */}
      <ScrollToTop label={ui.scrollToTop} threshold={400} />
    </div>
  );
}

export default Encyclopedia;
