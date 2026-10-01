import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectAuth } from '../store/authSlice'
import { selectChatList } from '../store/chatsSlice'
import { logoutAndReset } from '../store'
import { formatChatDate } from '../utils/format'
import Avatar from './Avatar'
import Logo from './Logo'
import NewChatForm from './NewChatForm'
import SettingsBanner from './SettingsBanner'

export default function Sidebar({ activeChatId }) {
  const dispatch = useDispatch()
  const chats = useSelector(selectChatList)
  const { idInstance } = useSelector(selectAuth)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, '') || '\0'))
  }, [chats, query])

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 pb-3 pt-4">
        <Logo />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight">Чаты</h1>
          <p className="truncate text-xs text-gray-400">Инстанс {idInstance}</p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          title="Новый чат"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition ${
            creating ? 'rotate-45 bg-gray-100 text-gray-600' : 'bg-max-500 text-white hover:bg-max-600'
          }`}
        >
          +
        </button>
        <button
          onClick={() => dispatch(logoutAndReset())}
          title="Выйти"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <SettingsBanner />
      {creating && <NewChatForm onDone={() => setCreating(false)} />}

      <div className="px-4 pb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск"
          className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-max-100"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {chats.length === 0 ? (
              <>
                Пока нет чатов.
                <br />
                Нажмите «+», чтобы начать новый.
              </>
            ) : (
              'Ничего не найдено'
            )}
          </div>
        )}

        {filtered.map((chat) => {
          const last = chat.messages.at(-1)
          const active = chat.chatId === activeChatId
          return (
            <Link
              key={chat.chatId}
              to={`/chats/${encodeURIComponent(chat.chatId)}`}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                active ? 'bg-max-50' : 'hover:bg-gray-50'
              }`}
            >
              <Avatar name={chat.name} seed={chat.chatId} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{chat.name}</span>
                  <span className="shrink-0 text-xs text-gray-400">{formatChatDate(last?.timestamp ?? chat.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-gray-500">
                    {last ? (
                      <>
                        {last.direction === 'out' && <span className="text-max-600">Вы: </span>}
                        {last.text}
                      </>
                    ) : (
                      <span className="italic">Нет сообщений</span>
                    )}
                  </span>
                  {chat.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-max-500 px-1.5 text-xs font-semibold text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
