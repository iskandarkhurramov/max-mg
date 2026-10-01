import { useState } from 'react'

const MAX_LENGTH = 4000

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0

  const submit = (e) => {
    e?.preventDefault()
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e)
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Сообщение"
        className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl bg-gray-100 px-4 py-3 text-[15px] outline-none [field-sizing:content] focus:ring-2 focus:ring-max-100"
      />
      <button
        type="submit"
        disabled={!canSend}
        title="Отправить"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-max-500 text-white transition hover:bg-max-600 disabled:bg-gray-200 disabled:text-gray-400"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
        </svg>
      </button>
    </form>
  )
}
