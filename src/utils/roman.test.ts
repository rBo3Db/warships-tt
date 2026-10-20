import { describe, it, expect } from 'vitest';
import { toRomanTier } from './roman';

describe('toRomanTier', () => {
  it('converts numbers from 1 to 11 to Roman numerals', () => {
    expect(toRomanTier(1)).toBe('I');
    expect(toRomanTier(2)).toBe('II');
    expect(toRomanTier(3)).toBe('III');
    expect(toRomanTier(4)).toBe('IV');
    expect(toRomanTier(5)).toBe('V');
    expect(toRomanTier(6)).toBe('VI');
    expect(toRomanTier(7)).toBe('VII');
    expect(toRomanTier(8)).toBe('VIII');
    expect(toRomanTier(9)).toBe('IX');
    expect(toRomanTier(10)).toBe('X');
    expect(toRomanTier(11)).toBe('XI');
  });

  it('falls back to string representation for unsupported numbers', () => {
    expect(toRomanTier(0)).toBe('0');
    expect(toRomanTier(12)).toBe('12');
    expect(toRomanTier(99)).toBe('99');
  });
});
