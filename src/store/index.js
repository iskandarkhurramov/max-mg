import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout } from './authSlice'
import chatsReducer, { chatsLoaded, chatsReset } from './chatsSlice'
import { loadChats, saveAuth, saveChats } from '../utils/storage'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatsReducer,
  },
})

// Restore chat history for a saved session
const initialAuth = store.getState().auth
if (initialAuth.isAuthorized) store.dispatch(chatsLoaded(loadChats(initialAuth.idInstance)))

// Persist credentials and per-instance chat history to localStorage
let prevAuth = store.getState().auth
let prevChats = store.getState().chats
store.subscribe(() => {
  const { auth, chats } = store.getState()

  if (auth !== prevAuth) {
    const loggedIn = auth.isAuthorized && !prevAuth.isAuthorized
    prevAuth = auth
    saveAuth(
      auth.isAuthorized
        ? { idInstance: auth.idInstance, apiTokenInstance: auth.apiTokenInstance, apiUrl: auth.apiUrl }
        : null,
    )
    if (loggedIn) {
      store.dispatch(chatsLoaded(loadChats(auth.idInstance)))
      return
    }
  }

  if (chats !== prevChats) {
    prevChats = chats
    if (auth.isAuthorized) saveChats(auth.idInstance, chats)
  }
})

export const logoutAndReset = () => (dispatch) => {
  dispatch(logout())
  dispatch(chatsReset())
}
