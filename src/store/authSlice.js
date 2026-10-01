import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { DEFAULT_API_URL, getSettings, getStateInstance, setSettings } from '../api/greenApi'
import { loadAuth } from '../utils/storage'

const saved = loadAuth()

const emptyState = {
  idInstance: '',
  apiTokenInstance: '',
  apiUrl: DEFAULT_API_URL,
  isAuthorized: false,
  status: 'idle',
  error: null,
  // HTTP API needs webhookUrl empty and incomingWebhook enabled: 'unknown' | 'ok' | 'misconfigured' | 'saving'
  settingsStatus: 'unknown',
}

const initialState = saved?.idInstance && saved?.apiTokenInstance
  ? { ...emptyState, ...saved, isAuthorized: true }
  : emptyState

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const result = await getStateInstance(credentials)
    if (result?.stateInstance && result.stateInstance !== 'authorized') {
      return rejectWithValue(
        `Инстанс не авторизован (состояние: ${result.stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`,
      )
    }
    return credentials
  } catch (error) {
    return rejectWithValue(
      error.status ? error.message : 'Не удалось подключиться к GREEN-API. Проверьте apiUrl и интернет-соединение.',
    )
  }
})

export const checkInstanceSettings = createAsyncThunk('auth/checkSettings', async (_, { getState }) => {
  const settings = await getSettings(selectCredentials(getState()))
  return Boolean(settings) && !settings.webhookUrl && settings.incomingWebhook !== 'no'
})

export const fixInstanceSettings = createAsyncThunk('auth/fixSettings', async (_, { getState }) => {
  await setSettings(selectCredentials(getState()))
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => emptyState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = 'idle'
        state.idInstance = payload.idInstance
        state.apiTokenInstance = payload.apiTokenInstance
        state.apiUrl = payload.apiUrl
        state.isAuthorized = true
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = 'idle'
        state.error = payload ?? 'Ошибка авторизации'
      })
      .addCase(checkInstanceSettings.fulfilled, (state, { payload: ok }) => {
        state.settingsStatus = ok ? 'ok' : 'misconfigured'
      })
      .addCase(fixInstanceSettings.pending, (state) => {
        state.settingsStatus = 'saving'
      })
      .addCase(fixInstanceSettings.fulfilled, (state) => {
        state.settingsStatus = 'ok'
      })
      .addCase(fixInstanceSettings.rejected, (state) => {
        state.settingsStatus = 'misconfigured'
      })
  },
})

export const { logout } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectCredentials = (state) => ({
  idInstance: state.auth.idInstance,
  apiTokenInstance: state.auth.apiTokenInstance,
  apiUrl: state.auth.apiUrl,
})

export default authSlice.reducer
