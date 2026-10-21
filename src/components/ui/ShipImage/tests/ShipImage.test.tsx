import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShipImage } from '../ShipImage';
import { I18nProvider } from '../../../../context/I18nContext';

describe('ShipImage component', () => {
  it('renders image element when src is provided', () => {
    render(
      <I18nProvider>
        <ShipImage src="https://example.com/ship.png" alt="Yamato" />
      </I18nProvider>
    );

    const img = screen.getByRole('img', { name: 'Yamato' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/ship.png');
  });

  it('renders fallback when src is missing', () => {
    render(
      <I18nProvider>
        <ShipImage src="" alt="Yamato" fallbackText="No image available" />
      </I18nProvider>
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });
});
