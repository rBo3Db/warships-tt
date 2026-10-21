import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TechTreePremiums } from '../components/TechTreePremiums';
import { TechTreePremiumCard } from '../components/TechTreePremiumCard';
import { I18nProvider } from '../../../context/I18nContext';
import { ConfigProvider } from '../../../context/ConfigContext';
import type { Vehicle, VehicleTypeInfo } from '../../../types/vehicle';

describe('TechTreePremiums and TechTreePremiumCard', () => {
  const mockCruiserType: VehicleTypeInfo = {
    sort_order: 1,
    icons: {
      default: 'cruiser_default.png',
      normal: 'cruiser_normal.png',
      elite: 'cruiser_elite.png',
      premium: 'cruiser_premium.png',
      special: 'cruiser_special.png',
    },
    localization: { mark: { ru: 'Крейсер', en: 'Cruiser' } },
  };

  const mockSpecialShip: Vehicle = {
    id: 'stalingrad',
    name: 'Stalingrad',
    level: 10,
    type: 'Cruiser',
    nation: 'ussr',
    tags: ['special'],
    icons: { default: 'stalingrad.png' },
    localization: { mark: { ru: 'Сталинград', en: 'Stalingrad' } },
  };

  const mockPremiumShip: Vehicle = {
    id: 'atago',
    name: 'Atago',
    level: 8,
    type: 'Cruiser',
    nation: 'japan',
    tags: ['premium'],
    icons: { default: 'atago.png' },
    localization: { mark: { ru: 'Атаго', en: 'Atago' } },
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <I18nProvider>
        <ConfigProvider
          mediaPath="https://example.com"
          nations={[]}
          vehicleTypes={{ Cruiser: mockCruiserType }}
        >
          {ui}
        </ConfigProvider>
      </I18nProvider>
    );
  };

  it('returns null when ships array is empty', () => {
    const { container } = renderWithProviders(
      <TechTreePremiums ships={[]} isSearchActive={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading and cards for premium and special ships', () => {
    renderWithProviders(
      <TechTreePremiums
        ships={[mockSpecialShip, mockPremiumShip]}
        isSearchActive={false}
      />
    );

    expect(screen.getByText(/Сталинград|Stalingrad/i)).toBeInTheDocument();
    expect(screen.getByText(/Атаго|Atago/i)).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('VIII')).toBeInTheDocument();
  });

  it('applies matched and dimmed classes during active search', () => {
    const { container } = renderWithProviders(
      <TechTreePremiums
        ships={[mockSpecialShip, mockPremiumShip]}
        matchingShipIds={new Set(['stalingrad'])}
        isSearchActive={true}
      />
    );

    const stalingradCard = container.querySelector('[data-ship-matched="true"]');
    const atagoCard = container.querySelector('[data-ship-matched="false"]');

    expect(stalingradCard).toBeInTheDocument();
    expect(atagoCard).toBeInTheDocument();

    expect(stalingradCard?.className).toMatch(/nodeCardMatch/);
    expect(atagoCard?.className).toMatch(/nodeCardDimmed/);
  });

  it('TechTreePremiumCard renders badges and roman tier correctly', () => {
    renderWithProviders(
      <TechTreePremiumCard
        ship={mockSpecialShip}
        isMatch={false}
        isDimmed={false}
      />
    );

    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText(/special/i)).toBeInTheDocument();
  });
});
