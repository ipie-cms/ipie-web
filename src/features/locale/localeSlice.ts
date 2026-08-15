import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { loadStoredLocale, saveStoredLocale, type Locale } from '@/lib/localeStorage'

export interface LocaleState {
  current: Locale
}

const initialState: LocaleState = {
  current: loadStoredLocale(),
}

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.current = action.payload
      saveStoredLocale(action.payload)
    },
  },
})

export const { setLocale } = localeSlice.actions
export default localeSlice.reducer
