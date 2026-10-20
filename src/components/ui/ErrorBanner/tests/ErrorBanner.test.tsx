import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner component', () => {
  it('renders message text', () => {
    render(<ErrorBanner message="Connection lost" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });

  it('renders retry button and triggers callback on click', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorBanner
        message="Sync failed"
        retryLabel="Попробовать снова"
        onRetry={handleRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: 'Попробовать снова' });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders dismiss button and triggers callback on click', () => {
    const handleDismiss = vi.fn();
    render(
      <ErrorBanner
        message="Sync failed"
        dismissLabel="Закрыть"
        onDismiss={handleDismiss}
      />
    );

    const dismissBtn = screen.getByRole('button', { name: 'Закрыть' });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
