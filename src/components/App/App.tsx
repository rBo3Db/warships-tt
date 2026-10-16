import { use, useState, Suspense } from 'react';
import { fetchAppData, buildFlagUrl, type AppData } from '../../services/nationsService';
import { Loader } from '../ui/Loader';
import { getLanguageTitle } from '../../utils/language';
import styles from './App.module.css';

interface NationsListProps {
  dataPromise: Promise<AppData>;
}

function NationsList({ dataPromise }: NationsListProps) {
  // Получаем и страны, и динамический mediaPath из эндпоинта
  const { nations, mediaPath } = use(dataPromise);

  const [selectedLang, setSelectedLang] = useState('ru');
  const [selectedNationId, setSelectedNationId] = useState<number | null>(null);

  // Список языков из данных
  const languages = Array.from(
    new Set(nations.flatMap((n) => Object.keys(n.localization?.mark || {})))
  );

  return (
    <div className={styles.container}>
      {/* Выбор языка */}
      <div className={styles.langPicker}>
        <label htmlFor="language-select">Язык: </label>
        <select
          id="language-select"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
        >
          {languages.map((code) => (
            <option key={code} value={code}>
              {getLanguageTitle(code)} ({code})
            </option>
          ))}
        </select>
      </div>

      {/* Список стран */}
      <div className={styles.list}>
        {nations.map((nation) => {
          const title = nation.localization?.mark?.[selectedLang] || nation.name;
          const flagUrl = buildFlagUrl(mediaPath, nation.icons.large || nation.icons.default);
          const isSelected = selectedNationId === nation.id;

          return (
            <button
              key={nation.id}
              type="button"
              className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
              onClick={() => setSelectedNationId(nation.id)}
            >
              <img
                src={flagUrl}
                alt={title}
                className={styles.flag}
                loading="lazy"
              />
              <span className={styles.name}>{title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function App() {
  const [dataPromise] = useState(() => fetchAppData());

  return (
    <Suspense fallback={<Loader text="Загрузка наций..." />}>
      <NationsList dataPromise={dataPromise} />
    </Suspense>
  );
}

export default App;
