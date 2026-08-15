import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { clearStoredAuth, loadStoredAuth, saveStoredAuth, type StoredAuth } from '@/lib/authStorage'

export type Credentials = StoredAuth

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  clientId: string | null
}

const stored = loadStoredAuth()

const initialState: AuthState = {
  accessToken: stored?.accessToken ?? null,
  refreshToken: stored?.refreshToken ?? null,
  username: stored?.username ?? null,
  clientId: stored?.clientId ?? null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.username = action.payload.username
      state.clientId = action.payload.clientId
      saveStoredAuth(action.payload)
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.username = null
      state.clientId = null
      clearStoredAuth()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
