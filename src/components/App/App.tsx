import { use, useState, useRef, useMemo, useEffect, Suspense } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { fetchAppData, syncAppData, type AppData } from '../../services/nationsService';
import { getUiTranslation } from '../../utils/i18n';
import { toRomanTier } from '../../utils/roman';
import { Loader } from '../ui/Loader';
import { Header } from '../Header';
import { NationsBar } from '../NationsBar';
import { Catalog } from '../Catalog';
import { TechTree } from '../TechTree/TechTree';
import { ScrollToTop } from '../ui/ScrollToTop';
import styles from './App.module.css';

interface NationsListProps {
  dataPromise: Promise<AppData>;
}

function doesShipMatch(ship: Vehicle, q: string, lang: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const nameLocalized = (ship.localization?.mark?.[lang] || '').toLowerCase();
  const shortLocalized = (ship.localization?.shortmark?.[lang] || '').toLowerCase();
  const nameEn = (ship.localization?.mark?.en || '').toLowerCase();
  const rawName = (ship.name || '').toLowerCase();
  const tierNum = String(ship.level);
  const tierRoman = toRomanTier(ship.level).toLowerCase();
  const typeLower = (ship.type || '').toLowerCase();

  return (
    nameLocalized.includes(lower) ||
    shortLocalized.includes(lower) ||
    nameEn.includes(lower) ||
    rawName.includes(lower) ||
    lower === tierNum ||
    lower === tierRoman ||
    typeLower.includes(lower)
  );
}

function NationsList({ dataPromise }: NationsListProps) {
  const initialData = use(dataPromise);
  const [appData, setAppData] = useState<AppData>(initialData);

  useEffect(() => {
    syncAppData((partial) => {
      setAppData((prev) => ({ ...prev, ...partial }));
    });
  }, []);

  const { nations, mediaPath, vehicleTypes, vehicles } = appData;

  // Available language codes from nations data
  const languages = useMemo(() => {
    return Array.from(
      new Set(nations.flatMap((n) => Object.keys(n.localization?.mark || {})))
    );
  }, [nations]);

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

  // All ships of current nation (or all ships if no nation selected)
  const currentNationShips = useMemo(() => {
    if (!selectedNation) return vehicles;
    return vehicles.filter((s) => s.nation === selectedNation);
  }, [vehicles, selectedNation]);

  // Matching ships inside the currently displayed list
  const matchingShipIds = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return new Set<string>();
    const set = new Set<string>();
    for (const ship of currentNationShips) {
      if (doesShipMatch(ship, q, selectedLang)) {
        set.add(ship.id);
      }
    }
    return set;
  }, [currentNationShips, searchQuery, selectedLang]);

  // Matching ships in other nations (only when a specific nation is selected)
  const otherNationMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (!selectedNation || !q || matchingShipIds.size > 0) return [];
    const result: Vehicle[] = [];
    for (const ship of vehicles) {
      if (ship.nation !== selectedNation && doesShipMatch(ship, q, selectedLang)) {
        result.push(ship);
        if (result.length >= 6) break;
      }
    }
    return result;
  }, [vehicles, selectedNation, searchQuery, selectedLang, matchingShipIds]);

  // Sorted ship types by sort_order
  const sortedTypes = useMemo(() => {
    return Object.entries(vehicleTypes).sort(
      ([, a], [, b]) => a.sort_order - b.sort_order
    );
  }, [vehicleTypes]);

  // Current section title
  const currentNationTitle = useMemo(() => {
    if (!selectedNation) return ui.allNations;
    const currentNationObj = nations.find((n) => n.name === selectedNation);
    return (
      currentNationObj?.localization?.mark?.[selectedLang] ||
      currentNationObj?.name ||
      selectedNation
    );
  }, [selectedNation, nations, selectedLang, ui.allNations]);

  // Filter and sort ships for catalog view
  const filteredCatalogShips = useMemo(() => {
    const q = searchQuery.trim();
    return currentNationShips
      .filter((ship) => !selectedType || ship.type === selectedType)
      .filter((ship) => selectedTier === null || ship.level === selectedTier)
      .filter((ship) => {
        if (selectedStatus === 'all') return true;
        const isPrem =
          ship.tags?.includes('uiPremium') ||
          ship.tags?.includes('special') ||
          ship.tags?.includes('uiSpecial');
        return selectedStatus === 'premium' ? isPrem : !isPrem;
      })
      .filter((ship) => !q || matchingShipIds.has(ship.id))
      .sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        const nameA = a.localization?.mark?.[selectedLang] || a.name;
        const nameB = b.localization?.mark?.[selectedLang] || b.name;
        return nameA.localeCompare(nameB);
      });
  }, [
    currentNationShips,
    selectedType,
    selectedTier,
    selectedStatus,
    searchQuery,
    matchingShipIds,
    selectedLang,
  ]);

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
        nations={nations}
        mediaPath={mediaPath}
        onJumpToShip={handleJumpToOtherNationShip}
      />

      {/* Nations horizontal list */}
      <NationsBar
        nations={nations}
        selectedNation={selectedNation}
        onSelectNation={handleSelectNation}
        mediaPath={mediaPath}
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
          ) : currentNationShips.length === 0 ? (
            <div className={styles.empty}>{ui.noShips}</div>
          ) : (
            <TechTree
              nationShips={currentNationShips}
              selectedLang={selectedLang}
              mediaPath={mediaPath}
              vehicleTypes={vehicleTypes}
              ui={ui}
              searchQuery={searchQuery}
              matchingShipIds={matchingShipIds}
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
            mediaPath={mediaPath}
            vehicleTypes={vehicleTypes}
            nations={nations}
            ui={ui}
          />
        )}
      </section>

      {/* Floating Scroll to Top Button */}
      <ScrollToTop label={ui.scrollToTop} threshold={400} />
    </div>
  );
}

export function App() {
  const [dataPromise] = useState(() => fetchAppData());

  return (
    <Suspense fallback={<Loader />}>
      <NationsList dataPromise={dataPromise} />
    </Suspense>
  );
}

export default App;
