import { use, useState, useRef, useMemo, Suspense } from 'react';
import { fetchAppData, buildFlagUrl, type AppData } from '../../services/nationsService';
import { buildMediaUrl } from '../../services/vehiclesService';
import { Loader } from '../ui/Loader';
import { getLanguageTitle } from '../../utils/language';
import { toRomanTier } from '../../utils/roman';
import { getUiTranslation } from '../../utils/i18n';
import styles from './App.module.css';

interface NationsListProps {
  dataPromise: Promise<AppData>;
}

function NationsList({ dataPromise }: NationsListProps) {
  const { nations, mediaPath, vehicleTypes, vehicles } = use(dataPromise);

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

  const shipsSectionRef = useRef<HTMLDivElement>(null);

  // Current localized UI strings
  const ui = useMemo(() => getUiTranslation(selectedLang), [selectedLang]);

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

  // Filter and sort ships
  const filteredShips = useMemo(() => {
    return vehicles
      .filter((ship) => !selectedNation || ship.nation === selectedNation)
      .filter((ship) => !selectedType || ship.type === selectedType)
      .sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        const nameA = a.localization?.mark?.[selectedLang] || a.name;
        const nameB = b.localization?.mark?.[selectedLang] || b.name;
        return nameA.localeCompare(nameB);
      });
  }, [vehicles, selectedNation, selectedType, selectedLang]);

  const handleSelectNation = (nationName: string) => {
    setSelectedNation(nationName);
    shipsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentNationTitle =
    currentNationObj?.localization?.mark?.[selectedLang] || currentNationObj?.name || '';

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <h1 className={styles.title}>{ui.title}</h1>
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

      {/* Ship classes filter */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{ui.classes}</h2>
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
      </section>

      {/* Ships section */}
      <section ref={shipsSectionRef} className={styles.section}>
        <div className={styles.shipsHeader}>
          <h2 className={styles.sectionTitle}>
            {ui.ships}: {currentNationTitle}
          </h2>
          <span className={styles.count}>
            {ui.found}: {filteredShips.length}
          </span>
        </div>

        {filteredShips.length === 0 ? (
          <div className={styles.empty}>{ui.noShips}</div>
        ) : (
          <div className={styles.grid}>
            {filteredShips.map((ship) => {
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
