import type { Vehicle } from '../types/vehicle';
import { isPremiumOrSpecial } from './ship';

export interface TreeLink {
  fromId: string;
  toId: string;
}

export interface TechTreeData {
  tiers: number[];
  classes: string[];
  // grid[class][level] = list of researchable vehicles
  grid: Record<string, Record<number, Vehicle[]>>;
  links: TreeLink[];
  premiums: Vehicle[];
}

const CLASS_ORDER = ['Submarine', 'Destroyer', 'Cruiser', 'Battleship', 'AirCarrier'];

export function isResearchableShip(ship: Vehicle): boolean {
  if (ship.level === 1) return true;
  if (ship.tags?.includes('superShip')) return true;
  if (isPremiumOrSpecial(ship)) {
    return false;
  }
  return ship.tags?.includes('upgradeable') ?? false;
}

export function buildTechTreeData(nationShips: Vehicle[]): TechTreeData {
  const researchable: Vehicle[] = [];
  const premiums: Vehicle[] = [];

  for (const ship of nationShips) {
    if (isResearchableShip(ship)) {
      researchable.push(ship);
    } else {
      premiums.push(ship);
    }
  }

  // Find present tiers (usually 1..10 or 1..11)
  const maxTier = Math.max(...nationShips.map((s) => s.level), 10);
  const tiers: number[] = [];
  for (let t = 1; t <= maxTier; t++) {
    tiers.push(t);
  }

  // Find active classes for this nation
  const presentClasses = new Set(researchable.map((s) => s.type));
  const classes = CLASS_ORDER.filter((c) => presentClasses.has(c));
  if (classes.length === 0) {
    classes.push('Cruiser');
  }

  // Initialize grid
  const grid: Record<string, Record<number, Vehicle[]>> = {};
  for (const cls of classes) {
    grid[cls] = {};
    for (const t of tiers) {
      grid[cls][t] = [];
    }
  }

  // Populate grid
  for (const ship of researchable) {
    if (!grid[ship.type]) {
      grid[ship.type] = {};
      for (const t of tiers) grid[ship.type][t] = [];
    }
    if (!grid[ship.type][ship.level]) {
      grid[ship.type][ship.level] = [];
    }
    grid[ship.type][ship.level].push(ship);
  }

  // Sort ships in each cell by name
  for (const cls of Object.keys(grid)) {
    for (const t of tiers) {
      grid[cls][t]?.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Build links
  const links: TreeLink[] = [];
  const linkSet = new Set<string>();

  const addLink = (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return;
    const key = `${fromId}->${toId}`;
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({ fromId, toId });
    }
  };

  // 1. Tier 1 starter ship(s)
  const tier1Ships = researchable.filter((s) => s.level === 1);
  const primaryStarter = tier1Ships[0];

  if (primaryStarter) {
    // Connect Tier 1 starter to all Tier 2 ships across all classes
    for (const cls of classes) {
      const tier2InClass = grid[cls]?.[2] || [];
      for (const t2Ship of tier2InClass) {
        addLink(primaryStarter.id, t2Ship.id);
      }
    }
  }

  // 2. Class-internal progression from Tier 2 to MaxTier
  for (const cls of classes) {
    const classGrid = grid[cls];

    for (let t = 2; t < maxTier; t++) {
      const currentShips = classGrid[t] || [];
      const nextShips = classGrid[t + 1] || [];

      if (currentShips.length === 0 || nextShips.length === 0) continue;

      if (currentShips.length === 1 && nextShips.length >= 1) {
        // Single ship splits into 1 or more
        for (const next of nextShips) {
          addLink(currentShips[0].id, next.id);
        }
      } else if (currentShips.length > 1 && nextShips.length === 1) {
        // Multiple ships merge into single
        for (const curr of currentShips) {
          addLink(curr.id, nextShips[0].id);
        }
      } else {
        // Equal or multiple to multiple: link proportionally
        const ratio = currentShips.length / nextShips.length;
        for (let j = 0; j < nextShips.length; j++) {
          const i = Math.min(Math.floor(j * ratio), currentShips.length - 1);
          addLink(currentShips[i].id, nextShips[j].id);
        }
      }
    }

    // 3. If a class has no Tier 2 (e.g. Battleships or Carriers or Submarines start at T3, T4, or T6),
    // connect its first tier from the Cruiser or Destroyer of previous tier
    const firstTierWithShips = tiers.find((t) => (classGrid[t] || []).length > 0 && t > 2);
    if (firstTierWithShips && (classGrid[firstTierWithShips - 1] || []).length === 0) {
      const entryShips = classGrid[firstTierWithShips] || [];
      // Look for previous tier ship in Cruiser or Destroyer
      const donorClasses = ['Cruiser', 'Destroyer'].filter((c) => c !== cls);
      let donorShip: Vehicle | undefined;
      for (const donorCls of donorClasses) {
        const candidates = grid[donorCls]?.[firstTierWithShips - 1] || grid[donorCls]?.[firstTierWithShips - 2];
        if (candidates && candidates.length > 0) {
          donorShip = candidates[0];
          break;
        }
      }
      if (donorShip) {
        for (const entry of entryShips) {
          addLink(donorShip.id, entry.id);
        }
      }
    }
  }

  // Sort premiums by level ascending
  premiums.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  return {
    tiers,
    classes,
    grid,
    links,
    premiums,
  };
}

export interface ActiveLineage {
  nodeIds: Set<string>;
  linkKeys: Set<string>;
}

/**
 * Traverses ancestors and descendants of a ship node along tech tree links.
 */
export function calculateActiveLineage(
  hoveredShipId: string | null,
  links: TreeLink[]
): ActiveLineage {
  if (!hoveredShipId) {
    return { nodeIds: new Set<string>(), linkKeys: new Set<string>() };
  }

  const nodeIds = new Set<string>([hoveredShipId]);
  const linkKeys = new Set<string>();

  // 1. Ancestors
  let current = [hoveredShipId];
  while (current.length > 0) {
    const nextBatch: string[] = [];
    for (const id of current) {
      for (const link of links) {
        if (link.toId === id) {
          nodeIds.add(link.fromId);
          linkKeys.add(`${link.fromId}->${link.toId}`);
          nextBatch.push(link.fromId);
        }
      }
    }
    current = nextBatch;
  }

  // 2. Descendants
  current = [hoveredShipId];
  while (current.length > 0) {
    const nextBatch: string[] = [];
    for (const id of current) {
      for (const link of links) {
        if (link.fromId === id) {
          nodeIds.add(link.toId);
          linkKeys.add(`${link.fromId}->${link.toId}`);
          nextBatch.push(link.toId);
        }
      }
    }
    current = nextBatch;
  }

  return { nodeIds, linkKeys };
}

