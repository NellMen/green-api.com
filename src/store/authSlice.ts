import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Credentials } from '../types'

const STORAGE_KEY = 'max-chat-credentials'

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Credentials
  } catch {
    return null
  }
}

type AuthState = {
  credentials: Credentials | null
}

const initialState: AuthState = {
  credentials: loadCredentials(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<Credentials>) {
      state.credentials = action.payload
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload))
    },
    logout(state) {
      state.credentials = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
