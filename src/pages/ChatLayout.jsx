import { Outlet, useMatch } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useNotificationPolling from '../hooks/useNotificationPolling'

export default function ChatLayout() {
  useNotificationPolling()
  const chatId = useMatch('/chats/:chatId')?.params.chatId

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* On mobile only one pane is visible: the list, or the open chat */}
      <aside className={`${chatId ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-gray-200 md:w-90 md:shrink-0`}>
        <Sidebar activeChatId={chatId} />
      </aside>
      <main className={`${chatId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col`}>
        <Outlet />
      </main>
    </div>
  )
}
