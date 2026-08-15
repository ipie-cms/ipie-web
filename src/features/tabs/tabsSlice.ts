import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface OpenTab {
  path: string
  label: string
}

export interface TabsState {
  openTabs: OpenTab[]
}

const initialState: TabsState = {
  openTabs: [],
}

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    /** Opens `tab` as a new tab in the dashboard area, or is a no-op if that path is already open (never duplicates). */
    openTab(state, action: PayloadAction<OpenTab>) {
      const alreadyOpen = state.openTabs.some((tab) => tab.path === action.payload.path)
      if (!alreadyOpen) {
        state.openTabs.push(action.payload)
      }
    },
    closeTab(state, action: PayloadAction<{ path: string }>) {
      state.openTabs = state.openTabs.filter((tab) => tab.path !== action.payload.path)
    },
  },
})

export const { openTab, closeTab } = tabsSlice.actions
export default tabsSlice.reducer
