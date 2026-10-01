import { createAsyncThunk, createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import * as api from '../api/greenApi'
import { selectCredentials } from './authSlice'
import { formatPhone } from '../utils/format'

// byId[chatId] = { chatId, phone, name, messages: [{ id, text, timestamp, direction, status }], unread, updatedAt }
const initialState = { byId: {} }

export const createChat = createAsyncThunk(
  'chats/create',
  async ({ phone, name }, { getState, rejectWithValue }) => {
    const credentials = selectCredentials(getState())
    // MAX identifies users by a numeric chatId — resolve it from the phone number.
    // If checkAccount fails, fall back to "<phone>@c.us", which sendMessage also accepts.
    try {
      const result = await api.checkAccount(credentials, phone)
      if (result?.exist === false) {
        return rejectWithValue('Этот номер не зарегистрирован в MAX')
      }
      return { chatId: String(result?.chatId || `${phone}@c.us`), phone, name }
    } catch {
      return { chatId: `${phone}@c.us`, phone, name }
    }
  },
)

export const sendMessage = createAsyncThunk('chats/sendMessage', async ({ chatId, text }, { getState }) => {
  const result = await api.sendMessage(selectCredentials(getState()), chatId, text)
  return { idMessage: result?.idMessage }
})

function ensureChat(state, chatId, { name, phone } = {}) {
  let chat = state.byId[chatId]
  if (!chat) {
    chat = state.byId[chatId] = {
      chatId,
      phone: phone ?? '',
      name: name || formatPhone(phone) || chatId,
      messages: [],
      unread: 0,
      updatedAt: Date.now(),
    }
  } else {
    if (name && !chat.customName) chat.name = name
    if (phone && !chat.phone) chat.phone = phone
  }
  return chat
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    chatsLoaded: (_state, { payload }) => payload ?? initialState,
    chatsReset: () => initialState,
    messageReceived(state, { payload }) {
      const { chatId, id, text, timestamp, direction, chatName, phone, isActive } = payload
      const chat = ensureChat(state, chatId, { name: chatName, phone })
      if (id && chat.messages.some((m) => m.id === id)) return
      chat.messages.push({ id: id || nanoid(), text, timestamp, direction, status: 'sent' })
      chat.updatedAt = Math.max(chat.updatedAt, timestamp)
      if (direction === 'in' && !isActive) chat.unread += 1
    },
    messageStatusUpdated(state, { payload }) {
      const { chatId, id, status } = payload
      // The status may carry another chatId form than the stored chat, so fall back to a search by id
      const chats = state.byId[chatId] ? [state.byId[chatId], ...Object.values(state.byId)] : Object.values(state.byId)
      for (const chat of chats) {
        const message = chat.messages.find((m) => m.id === id)
        if (message) {
          message.status = status
          return
        }
      }
    },
    chatRead(state, { payload: chatId }) {
      if (state.byId[chatId]) state.byId[chatId].unread = 0
    },
    chatDeleted(state, { payload: chatId }) {
      delete state.byId[chatId]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChat.fulfilled, (state, { payload }) => {
        const chat = ensureChat(state, payload.chatId, payload)
        if (payload.name) {
          chat.name = payload.name
          chat.customName = true
        }
        chat.updatedAt = Date.now()
      })
      .addCase(sendMessage.pending, (state, { meta }) => {
        const { chatId, text } = meta.arg
        const chat = ensureChat(state, chatId)
        chat.messages.push({ id: meta.requestId, text, timestamp: Date.now(), direction: 'out', status: 'pending' })
        chat.updatedAt = Date.now()
      })
      .addCase(sendMessage.fulfilled, (state, { meta, payload }) => {
        const chat = state.byId[meta.arg.chatId]
        const message = chat?.messages.find((m) => m.id === meta.requestId)
        if (!message) return
        // The same message may already have arrived through the notification queue.
        if (payload.idMessage && chat.messages.some((m) => m.id === payload.idMessage)) {
          chat.messages = chat.messages.filter((m) => m.id !== meta.requestId)
          return
        }
        message.id = payload.idMessage || message.id
        message.status = 'sent'
      })
      .addCase(sendMessage.rejected, (state, { meta, error }) => {
        const message = state.byId[meta.arg.chatId]?.messages.find((m) => m.id === meta.requestId)
        if (message) {
          message.status = 'failed'
          message.error = error.message
        }
      })
  },
})

export const { chatsLoaded, chatsReset, messageReceived, messageStatusUpdated, chatRead, chatDeleted } =
  chatsSlice.actions

export const selectChatList = createSelector([(state) => state.chats.byId], (byId) =>
  Object.values(byId).sort((a, b) => b.updatedAt - a.updatedAt),
)
export const selectChat = (state, chatId) => state.chats.byId[chatId]

export default chatsSlice.reducer
