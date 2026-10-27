'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { translate, type Language } from './messages';

const STORAGE_KEY = 'voxel-drop-language';
let sessionLanguage: Language | undefined;
const listeners = new Set<() => void>();

function getLanguage(): Language {
  if (sessionLanguage) return sessionLanguage;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    /* Browser preferences still work without storage. */
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    sessionLanguage = undefined;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function setLanguage(next: Language) {
  sessionLanguage = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Keep this session's choice. */
  }
  listeners.forEach((listener) => listener());
}

const getServerLanguage = (): Language => 'en';
type Translator = (
  source: string,
  values?: Readonly<Record<string, string | number>>,
) => string;
const I18nContext = createContext<{
  language: Language;
  locale: 'en-GB' | 'ru-RU';
  setLanguage: (language: Language) => void;
  t: Translator;
} | null>(null);

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    getServerLanguage,
  );
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      locale: language === 'en' ? ('en-GB' as const) : ('ru-RU' as const),
      setLanguage,
      t: ((source, values) =>
        translate(language, source, values)) as Translator,
    }),
    [language],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('I18nProvider is required');
  return context;
}
