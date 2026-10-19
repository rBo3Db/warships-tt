import type { VehicleIcons, VehicleLocalization } from '../types/vehicle';

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
