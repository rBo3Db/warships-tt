import { describe, it, expect } from 'vitest';
import {
  getShipTitle,
  isPremiumShip,
  isSpecialShip,
  isPremiumOrSpecial,
  getShipIconPath,
  getVehicleTypeIconPath,
  getVehicleTypeFallbackIcon,
} from '../ship';

describe('ship utilities', () => {
  describe('getShipTitle', () => {
    const ship = {
      name: 'Yamato_Default',
      localization: {
        mark: {
          ru: 'Ямато',
          en: 'Yamato',
        },
        shortmark: {
          ru: 'Ям',
          en: 'Yam',
          de: 'Yam_Short',
        },
      },
    };

    it('returns localized mark when available', () => {
      expect(getShipTitle(ship, 'ru')).toBe('Ямато');
      expect(getShipTitle(ship, 'en')).toBe('Yamato');
    });

    it('falls back to shortmark if mark is missing', () => {
      expect(getShipTitle(ship, 'de')).toBe('Yam_Short');
    });

    it('falls back to raw name if no localization matches or no lang provided', () => {
      expect(getShipTitle(ship, 'fr')).toBe('Yamato_Default');
      expect(getShipTitle(ship)).toBe('Yamato_Default');
    });
  });

  describe('premium and special detection', () => {
    it('detects uiPremium tag', () => {
      expect(isPremiumShip({ tags: ['uiPremium'] })).toBe(true);
      expect(isPremiumShip({ tags: ['upgradeable'] })).toBe(false);
      expect(isPremiumShip({})).toBe(false);
    });

    it('detects special and uiSpecial tags', () => {
      expect(isSpecialShip({ tags: ['special'] })).toBe(true);
      expect(isSpecialShip({ tags: ['uiSpecial'] })).toBe(true);
      expect(isSpecialShip({ tags: ['uiPremium'] })).toBe(false);
    });

    it('isPremiumOrSpecial handles both', () => {
      expect(isPremiumOrSpecial({ tags: ['uiPremium'] })).toBe(true);
      expect(isPremiumOrSpecial({ tags: ['special'] })).toBe(true);
      expect(isPremiumOrSpecial({ tags: ['uiSpecial'] })).toBe(true);
      expect(isPremiumOrSpecial({ tags: ['upgradeable'] })).toBe(false);
    });
  });

  describe('getShipIconPath', () => {
    it('prefers medium icon over large, small, default', () => {
      expect(
        getShipIconPath({
          icons: {
            medium: 'med.png',
            large: 'lrg.png',
            small: 'sml.png',
            default: 'def.png',
          },
        })
      ).toBe('med.png');
    });

    it('falls back in order: large -> small -> default', () => {
      expect(getShipIconPath({ icons: { large: 'lrg.png', default: 'def.png' } })).toBe('lrg.png');
      expect(getShipIconPath({ icons: { small: 'sml.png', default: 'def.png' } })).toBe('sml.png');
      expect(getShipIconPath({ icons: { default: 'def.png' } })).toBe('def.png');
    });

    it('returns undefined when icons object is missing or empty', () => {
      expect(getShipIconPath({})).toBeUndefined();
      expect(getShipIconPath({ icons: {} })).toBeUndefined();
    });
  });

  describe('getVehicleTypeIconPath', () => {
    const typeInfo = {
      sort_order: 1,
      localization: { mark: { en: 'Cruiser' } },
      icons: {
        normal: 'cruiser_normal.png',
        default: 'cruiser_default.png',
        premium: 'cruiser_premium.png',
        special: 'cruiser_special.png',
        elite: 'cruiser_elite.png',
      },
    };

    it('returns special icon for special ships', () => {
      expect(getVehicleTypeIconPath(typeInfo, { isSpecial: true })).toBe('cruiser_special.png');
    });

    it('returns premium icon for premium ships', () => {
      expect(getVehicleTypeIconPath(typeInfo, { isPremium: true })).toBe('cruiser_premium.png');
    });

    it('returns elite icon for elite ships', () => {
      expect(getVehicleTypeIconPath(typeInfo, { isElite: true })).toBe('cruiser_elite.png');
    });

    it('falls back to normal and default for regular ships', () => {
      expect(getVehicleTypeIconPath(typeInfo)).toBe('cruiser_normal.png');

      const noNormal = {
        ...typeInfo,
        icons: { ...typeInfo.icons, normal: '' },
      };
      expect(getVehicleTypeIconPath(noNormal)).toBe('cruiser_default.png');
    });

    it('returns undefined when typeInfo or icons missing', () => {
      expect(getVehicleTypeIconPath(undefined)).toBeUndefined();
      expect(getVehicleTypeIconPath({ sort_order: 1, localization: { mark: {} } } as any)).toBeUndefined();
    });
  });

  describe('getVehicleTypeFallbackIcon', () => {
    it('returns fallback data URI for all supported classes', () => {
      expect(getVehicleTypeFallbackIcon('Cruiser')).toContain('data:image/svg+xml');
      expect(getVehicleTypeFallbackIcon('Destroyer')).toContain('data:image/svg+xml');
      expect(getVehicleTypeFallbackIcon('Battleship')).toContain('data:image/svg+xml');
      expect(getVehicleTypeFallbackIcon('AirCarrier')).toContain('data:image/svg+xml');
      expect(getVehicleTypeFallbackIcon('Submarine')).toContain('data:image/svg+xml');
    });

    it('returns undefined for unknown or empty typeKey', () => {
      expect(getVehicleTypeFallbackIcon('UnknownClass')).toBeUndefined();
      expect(getVehicleTypeFallbackIcon()).toBeUndefined();
    });
  });
});

