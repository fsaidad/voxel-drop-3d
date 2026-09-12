'use client';

import { useSyncExternalStore } from 'react';

export type ColorScheme = 'light' | 'dark';

const QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot(): ColorScheme {
  return window.matchMedia(QUERY).matches ? 'dark' : 'light';
}

export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'dark');
}
