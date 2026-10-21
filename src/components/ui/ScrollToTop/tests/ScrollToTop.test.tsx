import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScrollToTop } from '../ScrollToTop';

describe('ScrollToTop component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is hidden when scrollY is below threshold', () => {
    window.scrollY = 100;
    render(<ScrollToTop threshold={400} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('becomes visible when scrollY exceeds threshold', () => {
    render(<ScrollToTop threshold={300} />);

    act(() => {
      window.scrollY = 350;
      fireEvent.scroll(window);
    });

    const btn = screen.getByRole('button', { name: 'Scroll to top' });
    expect(btn).toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    render(<ScrollToTop threshold={100} />);

    act(() => {
      window.scrollY = 200;
      fireEvent.scroll(window);
    });

    const btn = screen.getByRole('button', { name: 'Scroll to top' });
    fireEvent.click(btn);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
