import { describe, it, expect } from 'vitest';
import { buildMediaUrl, buildFlagUrl } from '../media';

describe('media utilities', () => {
  it('returns empty string if relativePath is empty or undefined', () => {
    expect(buildMediaUrl('https://media.wows.com')).toBe('');
    expect(buildMediaUrl('https://media.wows.com', '')).toBe('');
  });

  it('returns unchanged path if already absolute URL', () => {
    expect(buildMediaUrl('https://media.wows.com', 'https://cdn.example.com/flag.png')).toBe(
      'https://cdn.example.com/flag.png'
    );
    expect(buildMediaUrl('https://media.wows.com', 'http://cdn.example.com/flag.png')).toBe(
      'http://cdn.example.com/flag.png'
    );
  });

  it('joins base and relative path with single slash', () => {
    expect(buildMediaUrl('https://media.wows.com/', 'flags/japan.png')).toBe(
      'https://media.wows.com/flags/japan.png'
    );
    expect(buildMediaUrl('https://media.wows.com', 'flags/japan.png')).toBe(
      'https://media.wows.com/flags/japan.png'
    );
  });

  it('buildFlagUrl is an alias for buildMediaUrl', () => {
    expect(buildFlagUrl).toBe(buildMediaUrl);
  });
});
