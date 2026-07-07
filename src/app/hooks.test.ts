import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { todayIsoDate, parseIsoDateAsLocal } from './hooks';

describe('todayIsoDate', () => {
  const originalTz = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = 'Asia/Tokyo';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  it('uses the local (JST) calendar date rather than the UTC date', () => {
    // 2026-07-07T20:00:00Z is still July 7th in UTC, but 2026-07-08 05:00 in JST.
    vi.setSystemTime(new Date('2026-07-07T20:00:00.000Z'));
    expect(todayIsoDate()).toBe('2026-07-08');
  });

  it('matches the UTC date once local and UTC agree', () => {
    // Mid-afternoon JST is also the same calendar day in UTC.
    vi.setSystemTime(new Date('2026-07-08T06:00:00.000Z')); // JST 15:00
    expect(todayIsoDate()).toBe('2026-07-08');
  });
});

describe('parseIsoDateAsLocal', () => {
  it('produces a Date whose local calendar fields match the input string', () => {
    const date = parseIsoDateAsLocal('2026-07-08');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(8);
  });
});
