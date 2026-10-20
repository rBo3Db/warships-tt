import { useMemo } from 'react';
import { type Vehicle, ShipStatus, ShipSortOption } from '../../../types/vehicle';
import { toRomanTier } from '../../../utils/roman';
import { isPremiumOrSpecial, getShipTitle } from '../../../utils/ship';

const CLASS_SORT_ORDER: Record<string, number> = {
  Submarine: 1,
  Destroyer: 2,
  Cruiser: 3,
  Battleship: 4,
  AirCarrier: 5,
};

export interface UseShipsFilterParams {
  vehicles: Vehicle[];
  selectedNation: string | null;
  selectedType: string | null;
  selectedTier: number | null;
  selectedStatus: ShipStatus;
  selectedSort?: ShipSortOption;
  searchQuery: string;
  selectedLang: string;
}

export function doesShipMatch(ship: Vehicle, q: string, lang: string): boolean {
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

export function useShipsFilter({
  vehicles,
  selectedNation,
  selectedType,
  selectedTier,
  selectedStatus,
  selectedSort = ShipSortOption.TIER_ASC,
  searchQuery,
  selectedLang,
}: UseShipsFilterParams) {
  // All ships of current nation (or all ships if no nation selected)
  const currentNationShips = useMemo(() => {
    if (!selectedNation) return vehicles;
    return vehicles.filter((s) => s.nation === selectedNation);
  }, [vehicles, selectedNation]);

  // Set of matching ship IDs in current nation (empty if no search)
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

  // Filter and sort ships for catalog view
  const filteredCatalogShips = useMemo(() => {
    const q = searchQuery.trim();
    return currentNationShips
      .filter((ship) => !selectedType || ship.type === selectedType)
      .filter((ship) => selectedTier === null || ship.level === selectedTier)
      .filter((ship) => {
        if (selectedStatus === ShipStatus.ALL) return true;
        const isPrem = isPremiumOrSpecial(ship);
        return selectedStatus === ShipStatus.PREMIUM ? isPrem : !isPrem;
      })
      .filter((ship) => {
        if (!q) return true;
        return doesShipMatch(ship, q, selectedLang);
      })
      .sort((a, b) => {
        const nameA = getShipTitle(a, selectedLang);
        const nameB = getShipTitle(b, selectedLang);

        switch (selectedSort) {
          case ShipSortOption.TIER_DESC:
            if (b.level !== a.level) return b.level - a.level;
            return nameA.localeCompare(nameB);

          case ShipSortOption.NAME_ASC:
            return nameA.localeCompare(nameB);

          case ShipSortOption.NAME_DESC:
            return nameB.localeCompare(nameA);

          case ShipSortOption.TYPE: {
            const orderA = CLASS_SORT_ORDER[a.type] ?? 99;
            const orderB = CLASS_SORT_ORDER[b.type] ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            if (a.level !== b.level) return a.level - b.level;
            return nameA.localeCompare(nameB);
          }

          case ShipSortOption.TIER_ASC:
          default:
            if (a.level !== b.level) return a.level - b.level;
            return nameA.localeCompare(nameB);
        }
      });
  }, [
    currentNationShips,
    selectedType,
    selectedTier,
    selectedStatus,
    selectedSort,
    searchQuery,
    matchingShipIds,
    selectedLang,
  ]);

  return {
    currentNationShips,
    matchingShipIds,
    otherNationMatches,
    filteredCatalogShips,
  };
}

export default useShipsFilter;
