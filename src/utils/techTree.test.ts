import { describe, it, expect } from 'vitest';
import type { Vehicle } from '../types/vehicle';
import {
  isResearchableShip,
  buildTechTreeData,
  calculateActiveLineage,
} from './techTree';

const createShip = (overrides: Partial<Vehicle>): Vehicle => ({
  id: 'ship_1',
  name: 'Sample Ship',
  level: 1,
  nation: 'japan',
  type: 'Cruiser',
  tags: ['upgradeable'],
  icons: {},
  localization: { mark: {}, shortmark: {} },
  ...overrides,
});

describe('techTree utilities', () => {
  describe('isResearchableShip', () => {
    it('always considers level 1 ships as researchable', () => {
      expect(isResearchableShip(createShip({ level: 1, tags: [] }))).toBe(true);
    });

    it('considers superShips as researchable', () => {
      expect(isResearchableShip(createShip({ level: 11, tags: ['superShip'] }))).toBe(true);
    });

    it('excludes premium and special ships', () => {
      expect(
        isResearchableShip(createShip({ level: 8, tags: ['uiPremium', 'upgradeable'] }))
      ).toBe(false);
      expect(
        isResearchableShip(createShip({ level: 10, tags: ['special', 'upgradeable'] }))
      ).toBe(false);
    });

    it('requires upgradeable tag for non-tier-1 regular ships', () => {
      expect(isResearchableShip(createShip({ level: 5, tags: ['upgradeable'] }))).toBe(true);
      expect(isResearchableShip(createShip({ level: 5, tags: [] }))).toBe(false);
    });
  });

  describe('buildTechTreeData', () => {
    it('separates researchable and premium ships', () => {
      const ships: Vehicle[] = [
        createShip({ id: 's1', level: 1, type: 'Cruiser', tags: [] }),
        createShip({ id: 's2', level: 5, type: 'Cruiser', tags: ['upgradeable'] }),
        createShip({ id: 's3', level: 8, type: 'Battleship', tags: ['uiPremium'] }),
      ];

      const data = buildTechTreeData(ships);
      expect(data.premiums.map((s) => s.id)).toEqual(['s3']);
      expect(data.tiers).toContain(1);
      expect(data.tiers).toContain(10);
      expect(data.classes).toContain('Cruiser');
    });

    it('connects starter tier 1 ship to tier 2 ships', () => {
      const ships: Vehicle[] = [
        createShip({ id: 't1', level: 1, type: 'Cruiser', tags: [] }),
        createShip({ id: 't2_cruiser', level: 2, type: 'Cruiser', tags: ['upgradeable'] }),
        createShip({ id: 't2_dd', level: 2, type: 'Destroyer', tags: ['upgradeable'] }),
      ];

      const data = buildTechTreeData(ships);
      expect(data.links).toContainEqual({ fromId: 't1', toId: 't2_cruiser' });
      expect(data.links).toContainEqual({ fromId: 't1', toId: 't2_dd' });
    });
  });

  describe('calculateActiveLineage', () => {
    const links = [
      { fromId: 's1', toId: 's2' },
      { fromId: 's2', toId: 's3' },
      { fromId: 's3', toId: 's4' },
      { fromId: 'other', toId: 'other_2' },
    ];

    it('returns empty set if hoveredShipId is null', () => {
      expect(calculateActiveLineage(null, links).nodeIds.size).toBe(0);
    });

    it('includes ancestors, self, and descendants', () => {
      const lineage = calculateActiveLineage('s2', links);
      expect(lineage.nodeIds.has('s1')).toBe(true); // ancestor
      expect(lineage.nodeIds.has('s2')).toBe(true); // self
      expect(lineage.nodeIds.has('s3')).toBe(true); // descendant
      expect(lineage.nodeIds.has('s4')).toBe(true); // descendant
      expect(lineage.nodeIds.has('other')).toBe(false);
      expect(lineage.linkKeys.has('s1->s2')).toBe(true);
      expect(lineage.linkKeys.has('s2->s3')).toBe(true);
    });
  });
});
