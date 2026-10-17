export interface UiTranslations {
  title: string;
  language: string;
  nations: string;
  classes: string;
  allTypes: string;
  ships: string;
  found: string;
  noShips: string;
  noImage: string;
  premium: string;
  special: string;
  loading: string;
}

export const UI_TRANSLATIONS: Record<string, Partial<UiTranslations>> = {
  ru: {
    title: 'Справочник кораблей',
    language: 'Язык:',
    nations: 'Нации',
    classes: 'Классы кораблей',
    allTypes: 'Все типы',
    ships: 'Корабли',
    found: 'Найдено',
    noShips: 'Для выбранной нации и фильтра корабли не найдены',
    noImage: 'Нет изображения',
    premium: 'Премиум',
    special: 'Особый',
    loading: 'Загрузка...',
  },
  en: {
    title: 'Warships Encyclopedia',
    language: 'Language:',
    nations: 'Nations',
    classes: 'Ship Classes',
    allTypes: 'All Types',
    ships: 'Ships',
    found: 'Found',
    noShips: 'No ships found for selected nation and filter',
    noImage: 'No image',
    premium: 'Premium',
    special: 'Special',
    loading: 'Loading...',
  },
  de: {
    title: 'Kriegsschiffe-Enzyklopädie',
    language: 'Sprache:',
    nations: 'Nationen',
    classes: 'Schiffsklassen',
    allTypes: 'Alle Typen',
    ships: 'Schiffe',
    found: 'Gefunden',
    noShips: 'Keine Schiffe für die gewählte Nation und den Filter gefunden',
    noImage: 'Kein Bild',
    premium: 'Premium',
    special: 'Spezial',
    loading: 'Laden...',
  },
  fr: {
    title: 'Encyclopédie des navires',
    language: 'Langue :',
    nations: 'Nations',
    classes: 'Classes de navires',
    allTypes: 'Tous les types',
    ships: 'Navires',
    found: 'Trouvé',
    noShips: 'Aucun navire trouvé pour la nation et le filtre sélectionnés',
    noImage: 'Pas d\'image',
    premium: 'Premium',
    special: 'Spécial',
    loading: 'Chargement...',
  },
  es: {
    title: 'Enciclopedia de barcos',
    language: 'Idioma:',
    nations: 'Naciones',
    classes: 'Clases de barcos',
    allTypes: 'Todos los tipos',
    ships: 'Barcos',
    found: 'Encontrados',
    noShips: 'No se encontraron barcos para la nación y el filtro seleccionados',
    noImage: 'Sin imagen',
    premium: 'Premium',
    special: 'Especial',
    loading: 'Cargando...',
  },
  ja: {
    title: '艦艇百科事典',
    language: '言語:',
    nations: '国家',
    classes: '艦種',
    allTypes: '全タイプ',
    ships: '艦艇',
    found: '件数',
    noShips: '選択した国家とフィルターに一致する艦艇はありません',
    noImage: '画像なし',
    premium: 'プレミアム',
    special: '特別',
    loading: '読み込み中...',
  },
  zh_cn: {
    title: '战舰百科',
    language: '语言:',
    nations: '系别',
    classes: '战舰类型',
    allTypes: '全部类型',
    ships: '战舰',
    found: '找到',
    noShips: '未找到符合所选系别和筛选条件的战舰',
    noImage: '无图片',
    premium: '金币',
    special: '特种',
    loading: '加载中...',
  },
};

const DEFAULT_TRANSLATIONS: UiTranslations = {
  title: 'Warships Encyclopedia',
  language: 'Language:',
  nations: 'Nations',
  classes: 'Ship Classes',
  allTypes: 'All Types',
  ships: 'Ships',
  found: 'Found',
  noShips: 'No ships found for selected nation and filter',
  noImage: 'No image',
  premium: 'Premium',
  special: 'Special',
  loading: 'Loading...',
};

export function getUiTranslation(lang: string): UiTranslations {
  const custom = UI_TRANSLATIONS[lang] || {};
  return { ...DEFAULT_TRANSLATIONS, ...custom };
}
