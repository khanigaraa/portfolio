import { describe, expect, it } from 'vitest';
import { AUTO, MAX_DURATION_MS, next, shouldPlayIntro, type IntroEvent, type IntroState } from './machine';

/** Runs events from `idle`, returning every state visited. */
function run(...events: IntroEvent[]): IntroState[] {
  const states: IntroState[] = ['idle'];
  for (const e of events) states.push(next(states.at(-1)!, e));
  return states;
}

describe('intro state machine', () => {
  it('follows the full matchmaking flow', () => {
    expect(run('FIND_MATCH', 'SEARCH_DONE', 'ACCEPT', 'LOADED')).toEqual([
      'idle',
      'searching',
      'found',
      'loading',
      'done',
    ]);
  });

  it('never gets stuck: the countdown running out accepts for you', () => {
    expect(run('FIND_MATCH', 'SEARCH_DONE', 'COUNTDOWN_END', 'LOADED').at(-1)).toBe('done');
  });

  it('skips to done from any state', () => {
    for (const s of ['idle', 'searching', 'found', 'loading', 'done'] as IntroState[]) expect(next(s, 'SKIP')).toBe('done');
  });

  it('ignores events that do not apply', () => {
    expect(next('idle', 'ACCEPT')).toBe('idle');
    expect(next('searching', 'ACCEPT')).toBe('searching');
    expect(next('found', 'FIND_MATCH')).toBe('found');
    expect(next('done', 'FIND_MATCH')).toBe('done');
  });

  it('every state but done moves on by itself, within about 6 seconds in total', () => {
    let state: IntroState = 'idle';
    let elapsed = 0;
    while (state !== 'done') {
      const auto = AUTO[state]!;
      elapsed += auto.after;
      state = next(state, auto.event);
    }
    expect(elapsed).toBe(MAX_DURATION_MS);
    expect(MAX_DURATION_MS).toBeLessThanOrEqual(6500);
    expect(AUTO.found!.after).toBe(3000);
  });
});

describe('when the intro plays', () => {
  const base = { pathname: '/', seen: false, reducedMotion: false };

  it('on a first visit to the lobby', () => {
    expect(shouldPlayIntro(base)).toBe(true);
  });

  it('not for a returning visitor, a deep link, or reduced motion', () => {
    expect(shouldPlayIntro({ ...base, seen: true })).toBe(false);
    expect(shouldPlayIntro({ ...base, pathname: '/projects/high-availability' })).toBe(false);
    expect(shouldPlayIntro({ ...base, reducedMotion: true })).toBe(false);
  });
});
