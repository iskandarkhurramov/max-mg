import { Fragment, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useParams } from 'react-router-dom'
import { chatDeleted, chatRead, selectChat, sendMessage } from '../store/chatsSlice'
import { formatDayLabel, formatPhone } from '../utils/format'
import Avatar from './Avatar'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

export default function ChatWindow() {
  const { chatId } = useParams()
  const dispatch = useDispatch()
  const chat = useSelector((state) => selectChat(state, chatId))
  const bottomRef = useRef(null)

  const messageCount = chat?.messages.length ?? 0
  const unread = chat?.unread ?? 0

  useEffect(() => {
    if (unread > 0) dispatch(chatRead(chatId))
  }, [chatId, unread, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chatId, messageCount])

  if (!chat) return <Navigate to="/chats" replace />

  const subtitle = chat.phone ? formatPhone(chat.phone) : `ID: ${chat.chatId}`

  return (
    <>
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
        <Link to="/chats" className="-ml-1 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 md:hidden" title="Назад">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Avatar name={chat.name} seed={chat.chatId} size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">{chat.name}</h2>
          <p className="truncate text-xs text-gray-400">{subtitle}</p>
        </div>
        <button
          onClick={() => window.confirm('Удалить чат из списка?') && dispatch(chatDeleted(chat.chatId))}
          title="Удалить чат"
          className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-chat-bg px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
          {chat.messages.length === 0 && (
            <div className="mx-auto mt-10 rounded-2xl bg-white/70 px-4 py-3 text-center text-sm text-gray-500">
              Напишите первое сообщение
            </div>
          )}
          {chat.messages.map((message, i) => {
            const prev = chat.messages[i - 1]
            const newDay = !prev || new Date(prev.timestamp).toDateString() !== new Date(message.timestamp).toDateString()
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="my-2 self-center rounded-full bg-black/5 px-3 py-1 text-xs text-gray-500">
                    {formatDayLabel(message.timestamp)}
                  </div>
                )}
                <MessageBubble message={message} />
              </Fragment>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput onSend={(text) => dispatch(sendMessage({ chatId: chat.chatId, text }))} />
    </>
  )
}
