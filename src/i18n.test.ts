import { afterEach, describe, expect, it } from 'vitest';
import {
  MESSAGES,
  STORAGE_KEY,
  detectLang,
  getLang,
  initLang,
  memoryStorage,
  onLangChange,
  setLang,
  t,
  type MessageKey,
} from './i18n';

const init = (search = '', browserLangs: string[] = ['en-US'], storage = memoryStorage()) =>
  ({ lang: initLang({ search, storage, browserLangs }), storage });

afterEach(() => void init('?lang=id'));

describe('messages', () => {
  it('every message exists, non-empty, in both languages', () => {
    const idKeys = Object.keys(MESSAGES.id).sort();
    expect(Object.keys(MESSAGES.en).sort()).toEqual(idKeys);
    for (const key of idKeys as MessageKey[]) {
      expect(MESSAGES.id[key].trim(), `id: ${key}`).not.toBe('');
      expect(MESSAGES.en[key].trim(), `en: ${key}`).not.toBe('');
    }
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(t('projects.match', { n: '02' }, 'en')).toBe('Match #02');
    expect(t('projects.match', {}, 'id')).toBe('Match #{n}');
  });

  it('uses the current language by default', () => {
    init('?lang=en');
    expect(t('nav.projects')).toBe('Projects');
    setLang('id');
    expect(t('nav.projects')).toBe('Proyek');
  });
});

describe('language detection', () => {
  const storage = memoryStorage();

  it('a ?lang= link wins over everything', () => {
    storage.set(STORAGE_KEY, 'id');
    expect(detectLang({ search: '?lang=en', storage, browserLangs: ['id-ID'] })).toBe('en');
  });

  it('then the saved choice', () => {
    storage.set(STORAGE_KEY, 'id');
    expect(detectLang({ search: '', storage, browserLangs: ['en-GB'] })).toBe('id');
  });

  it('then the browser language: Indonesian for id*, English otherwise', () => {
    const empty = memoryStorage();
    expect(detectLang({ search: '', storage: empty, browserLangs: ['id-ID', 'en'] })).toBe('id');
    expect(detectLang({ search: '', storage: empty, browserLangs: ['id'] })).toBe('id');
    expect(detectLang({ search: '', storage: empty, browserLangs: ['nl-NL', 'id'] })).toBe('en');
    expect(detectLang({ search: '', storage: empty, browserLangs: [] })).toBe('en');
  });

  it('ignores an invalid ?lang= or saved value', () => {
    const bad = memoryStorage();
    bad.set(STORAGE_KEY, 'fr');
    expect(detectLang({ search: '?lang=de', storage: bad, browserLangs: ['id-ID'] })).toBe('id');
  });
});

describe('choosing a language', () => {
  it('remembers the choice for the next visit', () => {
    const { storage } = init('', ['en-US']);
    expect(getLang()).toBe('en');
    setLang('id');
    expect(storage.get(STORAGE_KEY)).toBe('id');
    expect(init('', ['en-US'], storage).lang).toBe('id');
  });

  it('remembers a language that came from a shared ?lang= link', () => {
    const { storage } = init('?lang=en', ['id-ID']);
    expect(storage.get(STORAGE_KEY)).toBe('en');
  });

  it('tells listeners about a change, once', () => {
    init('?lang=id');
    const seen: string[] = [];
    const off = onLangChange((l) => seen.push(l));
    setLang('en');
    setLang('en');
    off();
    setLang('id');
    expect(seen).toEqual(['en']);
  });
});
