import { useEffect } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import { selectCredentials } from '../store/authSlice'
import { messageReceived, messageStatusUpdated } from '../store/chatsSlice'

const RETRY_DELAY = 3000
// Long-poll window, seconds (API allows 5–60)
const RECEIVE_TIMEOUT = 20
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function extractText(messageData) {
  if (!messageData) return null
  switch (messageData.typeMessage) {
    case 'textMessage':
      return messageData.textMessageData?.textMessage ?? ''
    case 'extendedTextMessage':
    case 'quotedMessage':
      return messageData.extendedTextMessageData?.text ?? ''
    default:
      return 'Сообщение этого типа не поддерживается'
  }
}

// A chat created by phone may use "<phone>@c.us" while MAX reports a numeric chatId —
// match by phone so the reply lands in the chat the user opened.
function resolveChatId(state, chatId, phone) {
  if (state.chats.byId[chatId]) return chatId
  if (phone) {
    const byPhone = Object.values(state.chats.byId).find((c) => c.phone && c.phone === String(phone))
    if (byPhone) return byPhone.chatId
  }
  return chatId
}

function handleNotification(body, { dispatch, getState }) {
  const { typeWebhook } = body

  if (typeWebhook === 'outgoingMessageStatus') {
    dispatch(messageStatusUpdated({ chatId: body.chatId, id: body.idMessage, status: body.status }))
    return
  }

  const isIncoming = typeWebhook === 'incomingMessageReceived'
  const isOutgoing = typeWebhook === 'outgoingMessageReceived' || typeWebhook === 'outgoingAPIMessageReceived'
  if (!isIncoming && !isOutgoing) return

  const text = extractText(body.messageData)
  if (text === null) return

  // Messages sent from this app come back as outgoingAPIMessageReceived, possibly with
  // a different chatId form (numeric vs "<phone>@c.us") — skip ones we already have.
  const state = getState()
  if (body.idMessage && Object.values(state.chats.byId).some((c) => c.messages.some((m) => m.id === body.idMessage))) {
    return
  }

  const sender = body.senderData ?? {}
  const phone = sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : undefined
  const chatId = resolveChatId(state, sender.chatId, isIncoming ? phone : undefined)

  dispatch(
    messageReceived({
      chatId,
      id: body.idMessage,
      text,
      timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
      direction: isIncoming ? 'in' : 'out',
      chatName: isIncoming ? sender.chatName || sender.senderContactName || sender.senderName : undefined,
      phone: isIncoming ? phone : undefined,
    }),
  )
}

/** Long-polls the GREEN-API notification queue while the user is logged in. */
export default function useNotificationPolling() {
  const dispatch = useDispatch()
  const store = useStore()

  useEffect(() => {
    const controller = new AbortController()
    let stopped = false

    async function loop() {
      while (!stopped) {
        const credentials = selectCredentials(store.getState())
        try {
          const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT, controller.signal)
          if (stopped || !notification) continue

          try {
            handleNotification(notification.body ?? {}, { dispatch, getState: store.getState })
          } finally {
            // Always acknowledge, otherwise a malformed notification would block the queue
            await deleteNotification(credentials, notification.receiptId)
          }
        } catch (error) {
          if (stopped || error.name === 'AbortError') return
          console.warn('[GREEN-API] polling error:', error.message)
          await wait(RETRY_DELAY)
        }
      }
    }

    loop()
    return () => {
      stopped = true
      controller.abort()
    }
  }, [dispatch, store])
}
