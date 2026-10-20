import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorCard } from '../ErrorCard';

describe('ErrorCard component', () => {
  it('renders title and message correctly', () => {
    render(<ErrorCard title="Server Error" message="Could not fetch data" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText('Could not fetch data')).toBeInTheDocument();
  });

  it('renders retry button and triggers callback on click', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorCard
        title="Failed"
        message="Please retry"
        retryLabel="Повторить"
        onRetry={handleRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: 'Повторить' });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
