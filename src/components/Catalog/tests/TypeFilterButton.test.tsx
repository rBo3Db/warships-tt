import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TypeFilterButton } from '../filters/TypeFilterButton';
import { I18nProvider } from '../../../context/I18nContext';
import { ConfigProvider } from '../../../context/ConfigContext';
import type { VehicleTypeInfo } from '../../../types/vehicle';

describe('TypeFilterButton component', () => {
  const mockTypeInfo: VehicleTypeInfo = {
    sort_order: 1,
    icons: {
      default: 'cruiser_default.png',
      normal: 'cruiser_normal.png',
      elite: 'cruiser_elite.png',
      premium: 'cruiser_premium.png',
      special: 'cruiser_special.png',
    },
    localization: {
      mark: { ru: 'Крейсер', en: 'Cruiser' },
    },
  };

  const renderComponent = (isSelected = false, onToggle = vi.fn(), customTypeInfo = mockTypeInfo) => {
    return render(
      <I18nProvider>
        <ConfigProvider mediaPath="https://example.com" nations={[]} vehicleTypes={{ Cruiser: customTypeInfo }}>
          <TypeFilterButton
            typeKey="Cruiser"
            typeInfo={customTypeInfo}
            isSelected={isSelected}
            onToggle={onToggle}
          />
        </ConfigProvider>
      </I18nProvider>
    );
  };

  it('renders title and type icon', () => {
    renderComponent();
    expect(screen.getByText(/крейсер|cruiser/i)).toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('cruiser_normal.png');
  });

  it('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    renderComponent(false, handleToggle);

    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('uses fallback icon if typeInfo.icons is missing', () => {
    const noIconsInfo: VehicleTypeInfo = {
      sort_order: 1,
      icons: {} as any,
      localization: { mark: { en: 'Cruiser' } },
    };

    renderComponent(false, vi.fn(), noIconsInfo);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('data:image/svg+xml');
  });
});
