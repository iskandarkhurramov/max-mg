import { formatTime } from '../utils/format'

const STATUS_ICON = {
  pending: { icon: '🕓', title: 'Отправляется' },
  sent: { icon: '✓', title: 'Отправлено' },
  delivered: { icon: '✓✓', title: 'Доставлено' },
  read: { icon: '✓✓', title: 'Прочитано' },
  failed: { icon: '!', title: 'Не отправлено' },
}

export default function MessageBubble({ message }) {
  const outgoing = message.direction === 'out'
  const status = STATUS_ICON[message.status] ?? STATUS_ICON.sent

  return (
    <div className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          outgoing
            ? `rounded-br-md text-white ${message.status === 'failed' ? 'bg-red-500' : 'bg-max-500'}`
            : 'rounded-bl-md bg-white text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{message.text}</p>
        {message.status === 'failed' && (
          <p className="mt-1 text-xs text-white/90">Не отправлено{message.error ? `: ${message.error}` : ''}</p>
        )}
        <div className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${outgoing ? 'text-white/70' : 'text-gray-400'}`}>
          <span>{formatTime(message.timestamp)}</span>
          {outgoing && (
            <span title={message.error || status.title} className={message.status === 'read' ? 'text-sky-200' : ''}>
              {status.icon}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
