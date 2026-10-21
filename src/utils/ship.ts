import type { VehicleIcons, VehicleLocalization, VehicleTypeInfo } from '../types/vehicle';

/**
 * Returns localized mark of the ship, falling back to shortmark, and then raw name.
 */
export function getShipTitle(
  ship: { name: string; localization?: VehicleLocalization },
  lang?: string
): string {
  if (!lang) return ship.name;
  return (
    ship.localization?.mark?.[lang] ||
    ship.localization?.shortmark?.[lang] ||
    ship.name
  );
}

/**
 * Checks whether the ship has regular premium status ('uiPremium').
 */
export function isPremiumShip(ship: { tags?: string[] }): boolean {
  return Boolean(ship.tags?.includes('uiPremium'));
}

/**
 * Checks whether the ship is a special event/reward ship ('special' or 'uiSpecial').
 */
export function isSpecialShip(ship: { tags?: string[] }): boolean {
  return Boolean(ship.tags?.includes('special') || ship.tags?.includes('uiSpecial'));
}

/**
 * Checks whether the ship is either premium or special.
 */
export function isPremiumOrSpecial(ship: { tags?: string[] }): boolean {
  return isPremiumShip(ship) || isSpecialShip(ship);
}

/**
 * Resolves the best available ship icon path (fallback: medium -> large -> small -> default).
 */
export function getShipIconPath(
  ship: { icons?: VehicleIcons }
): string | undefined {
  return ship.icons?.medium || ship.icons?.large || ship.icons?.small || ship.icons?.default;
}

/**
 * Resolves vehicle type icon path with fallbacks:
 * - for special ships: special -> premium -> normal -> default
 * - for premium ships: premium -> normal -> default
 * - for elite ships: elite -> normal -> default
 * - default/regular: normal -> default
 */
export function getVehicleTypeIconPath(
  typeInfo?: VehicleTypeInfo,
  status?: { isPremium?: boolean; isSpecial?: boolean; isElite?: boolean }
): string | undefined {
  if (!typeInfo?.icons) return undefined;
  const { icons } = typeInfo;

  if (status?.isSpecial && icons.special) {
    return icons.special;
  }
  if (status?.isPremium && icons.premium) {
    return icons.premium;
  }
  if (status?.isElite && icons.elite) {
    return icons.elite;
  }
  return icons.normal || icons.default;
}

/**
 * Fallback SVG data URIs for ship types when API icons are unavailable.
 */
export const VEHICLE_TYPE_FALLBACK_ICONS: Record<string, string> = {
  // Destroyer: single diagonal slash
  Destroyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><polygon points="3,13 13,3 10,3 3,10"/></svg>',
  // Cruiser: double diagonal slashes
  Cruiser: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><polygon points="1,13 10,4 8,4 1,11"/><polygon points="6,13 15,4 13,4 6,11"/></svg>',
  // Battleship: triple diagonal slashes
  Battleship: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><polygon points="1,13 8,6 6,6 1,11"/><polygon points="5,13 12,6 10,6 5,11"/><polygon points="9,13 16,6 14,6 9,11"/></svg>',
  // AirCarrier: aircraft carrier wings/chevron
  AirCarrier: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><polygon points="8,2 2,12 5,12 8,7 11,12 14,12"/></svg>',
  // Submarine: submarine twin-hull icon
  Submarine: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="3"/><line x1="1" y1="8" x2="5" y2="8" stroke="white" stroke-width="2"/><line x1="11" y1="8" x2="15" y2="8" stroke="white" stroke-width="2"/></svg>',
};

export function getVehicleTypeFallbackIcon(typeKey?: string): string | undefined {
  if (!typeKey) return undefined;
  return VEHICLE_TYPE_FALLBACK_ICONS[typeKey];
}

