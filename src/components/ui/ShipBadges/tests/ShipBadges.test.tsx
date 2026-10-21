import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShipBadges } from '../ShipBadges';
import { I18nProvider } from '../../../../context/I18nContext';

describe('ShipBadges component', () => {
  it('renders nothing when neither premium nor special', () => {
    const { container } = render(
      <I18nProvider>
        <ShipBadges />
      </I18nProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders premium badge when isPremium is true', () => {
    render(
      <I18nProvider>
        <ShipBadges isPremium={true} />
      </I18nProvider>
    );
    expect(screen.getByText(/premium|премиум/i)).toBeInTheDocument();
  });

  it('renders special badge when isSpecial is true', () => {
    render(
      <I18nProvider>
        <ShipBadges isSpecial={true} />
      </I18nProvider>
    );
    expect(screen.getByText(/special|особый/i)).toBeInTheDocument();
  });

  it('renders both badges when both are true', () => {
    render(
      <I18nProvider>
        <ShipBadges isPremium={true} isSpecial={true} />
      </I18nProvider>
    );
    expect(screen.getByText(/premium|премиум/i)).toBeInTheDocument();
    expect(screen.getByText(/special|особый/i)).toBeInTheDocument();
  });
});
