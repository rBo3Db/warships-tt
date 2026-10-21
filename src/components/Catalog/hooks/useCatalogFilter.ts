import { useState, useMemo } from 'react';
import { type Vehicle, ShipStatus, ShipSortOption } from '../../../types/vehicle';
import { isPremiumOrSpecial, getShipTitle } from '../../../utils/ship';
import { doesShipMatch } from '../../Encyclopedia/hooks/useShipsFilter';
import { useInfiniteScroll, type UseInfiniteScrollResult } from '../../Encyclopedia/hooks/useInfiniteScroll';

const CLASS_SORT_ORDER: Record<string, number> = {
  Submarine: 1,
  Destroyer: 2,
  Cruiser: 3,
  Battleship: 4,
  AirCarrier: 5,
};

export interface UseCatalogFilterOptions {
  ships: Vehicle[];
  searchQuery?: string;
  selectedLang: string;
  chunkSize?: number;
}

export interface UseCatalogFilterResult {
  visibleShips: Vehicle[];
  totalFilteredCount: number;
  displayLimit: number;
  loadMoreRef: UseInfiniteScrollResult<Vehicle>['loadMoreRef'];
  hasMore: boolean;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedTier: number | null;
  setSelectedTier: (tier: number | null) => void;
  selectedStatus: ShipStatus;
  setSelectedStatus: (status: ShipStatus) => void;
  selectedSort: ShipSortOption;
  setSelectedSort: (sort: ShipSortOption) => void;
}

export function useCatalogFilter({
  ships,
  searchQuery = '',
  selectedLang,
  chunkSize = 36,
}: UseCatalogFilterOptions): UseCatalogFilterResult {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ShipStatus>(ShipStatus.ALL);
  const [selectedSort, setSelectedSort] = useState<ShipSortOption>(ShipSortOption.TIER_ASC);

  const filteredShips = useMemo(() => {
    const q = searchQuery.trim();
    return ships
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
    ships,
    selectedType,
    selectedTier,
    selectedStatus,
    selectedSort,
    searchQuery,
    selectedLang,
  ]);

  const {
    visibleItems: visibleShips,
    displayLimit,
    loadMoreRef,
    hasMore,
  } = useInfiniteScroll({
    items: filteredShips,
    chunkSize,
    resetDeps: [ships, selectedType, selectedTier, selectedStatus, selectedSort, searchQuery],
  });

  return {
    visibleShips,
    totalFilteredCount: filteredShips.length,
    displayLimit,
    loadMoreRef,
    hasMore,
    selectedType,
    setSelectedType,
    selectedTier,
    setSelectedTier,
    selectedStatus,
    setSelectedStatus,
    selectedSort,
    setSelectedSort,
  };
}

export default useCatalogFilter;
