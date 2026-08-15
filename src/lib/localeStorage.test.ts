import { afterEach, describe, expect, it } from 'vitest'

import { loadStoredLocale, saveStoredLocale, STORAGE_KEY } from '@/lib/localeStorage'

describe('localeStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('falls back to a supported browser language when nothing has been stored', () => {
    // jsdom's default navigator.language is en-US, which maps to the supported 'en' locale.
    expect(loadStoredLocale()).toBe('en')
  })

  it('round-trips a saved value', () => {
    saveStoredLocale('hi')

    expect(loadStoredLocale()).toBe('hi')
  })

  it('falls back to English instead of an unsupported stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'fr')

    expect(loadStoredLocale()).toBe('en')
  })
})
