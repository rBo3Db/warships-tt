import { use, useState, useRef, useMemo, useEffect, Suspense } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { fetchAppData, buildFlagUrl, syncAppData, type AppData } from '../../services/nationsService';
import { buildMediaUrl } from '../../services/vehiclesService';
import { Loader } from '../ui/Loader';
import { TechTree } from '../TechTree/TechTree';
import { getLanguageTitle } from '../../utils/language';
import { toRomanTier } from '../../utils/roman';
import { getUiTranslation } from '../../utils/i18n';
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

  const [selectedNation, setSelectedNation] = useState<string>(() => nations[0]?.name || 'usa');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [searchQuery, setSearchQuery] = useState('');

  const shipsSectionRef = useRef<HTMLDivElement>(null);

  // Current localized UI strings
  const ui = useMemo(() => getUiTranslation(selectedLang), [selectedLang]);

  // All ships of current nation
  const currentNationShips = useMemo(() => {
    return vehicles.filter((s) => s.nation === selectedNation);
  }, [vehicles, selectedNation]);

  // Matching ships inside the currently selected nation
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

  // Matching ships in other nations (if not found in current nation)
  const otherNationMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (!q || matchingShipIds.size > 0) return [];
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

  // Selected nation object
  const currentNationObj = useMemo(() => {
    return nations.find((n) => n.name === selectedNation) || nations[0];
  }, [nations, selectedNation]);

  // Filter and sort ships for catalog view
  const filteredCatalogShips = useMemo(() => {
    const q = searchQuery.trim();
    return currentNationShips
      .filter((ship) => !selectedType || ship.type === selectedType)
      .filter((ship) => !q || matchingShipIds.has(ship.id))
      .sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        const nameA = a.localization?.mark?.[selectedLang] || a.name;
        const nameB = b.localization?.mark?.[selectedLang] || b.name;
        return nameA.localeCompare(nameB);
      });
  }, [currentNationShips, selectedType, searchQuery, matchingShipIds, selectedLang]);

  const handleSelectNation = (nationName: string) => {
    setSelectedNation(nationName);
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJumpToOtherNationShip = (ship: Vehicle) => {
    setSelectedNation(ship.nation);
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentNationTitle =
    currentNationObj?.localization?.mark?.[selectedLang] || currentNationObj?.name || '';

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <h1 className={styles.title}>{ui.title}</h1>

        {/* Search Input */}
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={ui.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              title={ui.searchClear}
            >
              ✕
            </button>
          )}
        </div>

        {/* Language Selector */}
        <div className={styles.langPicker}>
          <label htmlFor="language-select">{ui.language} </label>
          <select
            id="language-select"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {languages.map((code) => (
              <option key={code} value={code}>
                {getLanguageTitle(code, selectedLang)} ({code})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Other nations search hints */}
      {otherNationMatches.length > 0 && (
        <div className={styles.otherNationsBanner}>
          <span>{ui.foundInOtherNations}</span>
          {otherNationMatches.map((ship) => {
            const nat = nations.find((n) => n.name === ship.nation);
            const flag = nat ? buildFlagUrl(mediaPath, nat.icons.small || nat.icons.default) : null;
            const shipTitle = ship.localization?.mark?.[selectedLang] || ship.name;
            return (
              <button
                key={ship.id}
                type="button"
                className={styles.otherNationChip}
                onClick={() => handleJumpToOtherNationShip(ship)}
              >
                {flag && <img src={flag} alt={ship.nation} className={styles.flag} style={{ width: 16, height: 10 }} />}
                <span>{shipTitle} ({toRomanTier(ship.level)})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Nations list */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{ui.nations}</h2>
        <div className={styles.list}>
          {nations.map((nation) => {
            const title = nation.localization?.mark?.[selectedLang] || nation.name;
            const flagUrl = buildFlagUrl(mediaPath, nation.icons.large || nation.icons.default);
            const isSelected = selectedNation === nation.name;

            return (
              <button
                key={nation.id}
                type="button"
                className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                onClick={() => handleSelectNation(nation.name)}
              >
                <img
                  src={flagUrl}
                  alt={title}
                  className={styles.flag}
                  loading="lazy"
                />
                <span>{title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* View Switcher and Filters */}
      <section ref={shipsSectionRef} className={styles.section}>
        <div className={styles.shipsHeader}>
          <h2 className={styles.sectionTitle}>
            {currentNationTitle}
          </h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              className={`${styles.item} ${viewMode === 'tree' ? styles.itemSelected : ''}`}
              onClick={() => setViewMode('tree')}
            >
              {ui.viewTree}
            </button>
            <button
              type="button"
              className={`${styles.item} ${viewMode === 'grid' ? styles.itemSelected : ''}`}
              onClick={() => setViewMode('grid')}
            >
              {ui.viewGrid}
            </button>
            <span className={styles.count}>
              ({searchQuery ? matchingShipIds.size : currentNationShips.length})
            </span>
          </div>
        </div>

        {viewMode === 'tree' ? (
          /* Tree View with drawn connections and search highlighting */
          currentNationShips.length === 0 ? (
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
          /* Catalog view with class filter */
          <>
            <div className={styles.list}>
              <button
                type="button"
                className={`${styles.item} ${selectedType === null ? styles.itemSelected : ''}`}
                onClick={() => setSelectedType(null)}
              >
                {ui.allTypes}
              </button>
              {sortedTypes.map(([typeKey, typeInfo]) => {
                const isSelected = selectedType === typeKey;
                const typeTitle = typeInfo.localization?.mark?.[selectedLang] || typeKey;
                const iconUrl = buildMediaUrl(mediaPath, typeInfo.icons?.default);

                return (
                  <button
                    key={typeKey}
                    type="button"
                    className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                    onClick={() => setSelectedType(isSelected ? null : typeKey)}
                  >
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={typeTitle}
                        className={styles.typeIcon}
                        loading="lazy"
                      />
                    )}
                    <span>{typeTitle}</span>
                  </button>
                );
              })}
            </div>

            {filteredCatalogShips.length === 0 ? (
              <div className={styles.empty}>{ui.noShips}</div>
            ) : (
              <div className={styles.grid}>
                {filteredCatalogShips.map((ship) => {
                  const shipTitle =
                    ship.localization?.mark?.[selectedLang] ||
                    ship.localization?.shortmark?.[selectedLang] ||
                    ship.name;

                  const typeInfo = vehicleTypes[ship.type];
                  const typeIconUrl = buildMediaUrl(mediaPath, typeInfo?.icons?.default);
                  const shipImgUrl = buildMediaUrl(
                    mediaPath,
                    ship.icons?.medium || ship.icons?.large || ship.icons?.small || ship.icons?.default
                  );

                  const isPremium = ship.tags?.includes('uiPremium');
                  const isSpecial = ship.tags?.includes('special') || ship.tags?.includes('uiSpecial');

                  return (
                    <div key={ship.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.tierType}>
                          <span>{toRomanTier(ship.level)}</span>
                          {typeIconUrl && (
                            <img
                              src={typeIconUrl}
                              alt={ship.type}
                              className={styles.typeIcon}
                              title={typeInfo?.localization?.mark?.[selectedLang] || ship.type}
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div>
                          {isPremium && <span className={styles.badge}>{ui.premium}</span>}
                          {isSpecial && <span className={styles.badge}>{ui.special}</span>}
                        </div>
                      </div>

                      <h3 className={styles.shipName} title={shipTitle}>
                        {shipTitle}
                      </h3>

                      {shipImgUrl ? (
                        <img
                          src={shipImgUrl}
                          alt={shipTitle}
                          className={styles.shipImage}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.empty}>{ui.noImage}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
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
