import { describe, it, expect } from 'vitest';
import * as messages from './messages';

const BANNED_WORDS = ['サボり', '失敗', '連続記録が途切れた', 'もっと追い込め', '根性'];

const staticStrings = Object.entries(messages).filter(
  (entry) => typeof entry[1] === 'string',
) as [string, string][];

describe('static message copy', () => {
  it.each(staticStrings)('%s contains no banned words', (_name, value) => {
    for (const banned of BANNED_WORDS) {
      expect(value).not.toContain(banned);
    }
  });
});

describe('getCompletionMessage', () => {
  it.each(['intro', 'A', 'B', 'short', 'rest', 'walk'] as const)(
    'workoutType=%s has no banned words',
    (workoutType) => {
      const text = messages.getCompletionMessage(workoutType);
      for (const banned of BANNED_WORDS) {
        expect(text).not.toContain(banned);
      }
    },
  );

  it('gives rest its own encouraging message', () => {
    expect(messages.getCompletionMessage('rest')).toContain('休息も計画の一部');
  });

  it('gives the short version its own encouraging message', () => {
    expect(messages.getCompletionMessage('short')).toContain('完全に成功');
  });
});

describe('EFFORT_LABEL', () => {
  it.each(Object.entries(messages.EFFORT_LABEL))('%s has no banned words', (_effort, label) => {
    for (const banned of BANNED_WORDS) {
      expect(label).not.toContain(banned);
    }
  });
});

describe('getMonthlyAchievementLine', () => {
  it.each([0, 1, 2, 5, 20])('count=%i has no banned words', (count) => {
    const text = messages.getMonthlyAchievementLine(count);
    for (const banned of BANNED_WORDS) {
      expect(text).not.toContain(banned);
    }
  });

  it('treats the first session as a positive start rather than a low count', () => {
    expect(messages.getMonthlyAchievementLine(1)).not.toMatch(/0|1回目/);
  });
});
