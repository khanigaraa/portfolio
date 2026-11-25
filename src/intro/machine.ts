/**
 * The matchmaking intro as a pure state machine (no DOM, no timers): the controller feeds it
 * events and schedules the automatic ones from `AUTO`.
 *
 *   idle      --FIND_MATCH (click / Enter / after IDLE_MS)--> searching
 *   searching --SEARCH_DONE (after SEARCH_MS)-->              found
 *   found     --ACCEPT (click / Enter)-->                     loading
 *   found     --COUNTDOWN_END (after COUNTDOWN_MS)-->         loading   (never stuck)
 *   loading   --LOADED (after LOADING_MS)-->                  done
 *   any       --SKIP (button / Esc)-->                        done
 *
 * A visitor who does nothing reaches the lobby in about 6 seconds.
 */
export type IntroState = 'idle' | 'searching' | 'found' | 'loading' | 'done';
export type IntroEvent = 'FIND_MATCH' | 'SEARCH_DONE' | 'ACCEPT' | 'COUNTDOWN_END' | 'LOADED' | 'SKIP';

export const IDLE_MS = 800;
export const SEARCH_MS = 1600;
export const COUNTDOWN_MS = 3000;
export const LOADING_MS = 900;

/** The event each state fires on its own, and after how long. */
export const AUTO: Partial<Record<IntroState, { event: IntroEvent; after: number }>> = {
  idle: { event: 'FIND_MATCH', after: IDLE_MS },
  searching: { event: 'SEARCH_DONE', after: SEARCH_MS },
  found: { event: 'COUNTDOWN_END', after: COUNTDOWN_MS },
  loading: { event: 'LOADED', after: LOADING_MS },
};

const TRANSITIONS: Record<IntroState, Partial<Record<IntroEvent, IntroState>>> = {
  idle: { FIND_MATCH: 'searching' },
  searching: { SEARCH_DONE: 'found' },
  found: { ACCEPT: 'loading', COUNTDOWN_END: 'loading' },
  loading: { LOADED: 'done' },
  done: {},
};

/** The next state, or the same one when the event does not apply (e.g. ACCEPT while searching). */
export function next(state: IntroState, event: IntroEvent): IntroState {
  if (event === 'SKIP') return 'done';
  return TRANSITIONS[state][event] ?? state;
}

/** Longest time the intro can take when nobody touches anything. */
export const MAX_DURATION_MS = IDLE_MS + SEARCH_MS + COUNTDOWN_MS + LOADING_MS;

export const INTRO_SEEN_KEY = 'stingtaw:intro-seen';

/**
 * Play the intro only on a first visit to the lobby: deep links (a recruiter opening a case study)
 * go straight to what was asked for, returning visitors are not made to wait twice, and
 * reduced motion skips it.
 */
export function shouldPlayIntro(opts: { pathname: string; seen: boolean; reducedMotion: boolean }): boolean {
  return opts.pathname === '/' && !opts.seen && !opts.reducedMotion;
}
