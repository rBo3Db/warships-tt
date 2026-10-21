import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NationButton } from '../components/NationButton';
import { I18nProvider } from '../../../context/I18nContext';
import { ConfigProvider } from '../../../context/ConfigContext';
import type { Nation } from '../../../types/nation';

const mockNation: Nation = {
  id: 1,
  name: 'japan',
  color: 0,
  tags: [],
  icons: {
    default: 'japan_flag.png',
    large: 'japan_flag_large.png',
    local_large: 'japan_flag_large.png',
    local_tiny: 'japan_flag_tiny.png',
    small: 'japan_flag_small.png',
    local_small: 'japan_flag_small.png',
    tiny: 'japan_flag_tiny.png',
  },
  localization: {
    mark: { ru: 'Япония', en: 'Japan' },
  },
};

describe('NationButton component', () => {
  const renderButton = (isSelected = false, onSelect = vi.fn()) => {
    return render(
      <I18nProvider>
        <ConfigProvider mediaPath="https://example.com" nations={[mockNation]} vehicleTypes={{}}>
          <NationButton nation={mockNation} isSelected={isSelected} onSelect={onSelect} />
        </ConfigProvider>
      </I18nProvider>
    );
  };

  it('renders nation title and flag image', () => {
    renderButton();
    expect(screen.getByText(/япония|japan/i)).toBeInTheDocument();
    const flag = screen.getByRole('img');
    expect(flag).toBeInTheDocument();
  });

  it('triggers onSelect when clicked', () => {
    const handleSelect = vi.fn();
    renderButton(false, handleSelect);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleSelect).toHaveBeenCalledWith('japan');
  });
});
