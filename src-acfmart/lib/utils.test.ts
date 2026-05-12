import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles falsy values without throwing', () => {
    expect(cn('foo', undefined, null as any, false as any, 'bar')).toBe('foo bar');
  });

  it('returns empty string when no args', () => {
    expect(cn()).toBe('');
  });
});
