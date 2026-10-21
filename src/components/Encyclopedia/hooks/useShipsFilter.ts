import { useMemo } from 'react';
import type { Vehicle } from '../../../types/vehicle';
import { toRomanTier } from '../../../utils/roman';

export interface UseShipsFilterParams {
  vehicles: Vehicle[];
  selectedNation: string | null;
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

  return {
    currentNationShips,
    matchingShipIds,
    otherNationMatches,
  };
}

export default useShipsFilter;
