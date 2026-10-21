import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../Loader';

describe('Loader component', () => {
  it('renders with role="status" and default aria-label', () => {
    render(<Loader />);
    const loaderEl = screen.getByRole('status');
    expect(loaderEl).toBeInTheDocument();
    expect(loaderEl).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts custom className and aria-label', () => {
    render(<Loader className="custom-class" aria-label="Custom loading" />);
    const loaderEl = screen.getByRole('status');
    expect(loaderEl).toHaveClass('custom-class');
    expect(loaderEl).toHaveAttribute('aria-label', 'Custom loading');
  });
});
