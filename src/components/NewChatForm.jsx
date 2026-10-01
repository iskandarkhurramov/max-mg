import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createChat } from '../store/chatsSlice'
import { normalizePhone } from '../utils/format'

export default function NewChatForm({ onDone }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const digits = normalizePhone(phone)
    if (digits.length < 10 || digits.length > 15) {
      setError('Введите номер в международном формате, например 79001234567')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { chatId } = await dispatch(createChat({ phone: digits, name: name.trim() })).unwrap()
      onDone()
      navigate(`/chats/${encodeURIComponent(chatId)}`)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Не удалось создать чат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-4 mb-3 rounded-2xl border border-max-100 bg-max-50/60 p-3">
      <p className="mb-2 text-sm font-semibold">Новый чат</p>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Номер телефона: 79001234567"
        inputMode="tel"
        autoFocus
        className="mb-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-max-500"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Имя (необязательно)"
        className="mb-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-max-500"
      />
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !phone.trim()}
        className="w-full rounded-xl bg-max-500 py-2 text-sm font-semibold text-white transition hover:bg-max-600 disabled:opacity-50"
      >
        {loading ? 'Создаём…' : 'Создать чат'}
      </button>
    </form>
  )
}
