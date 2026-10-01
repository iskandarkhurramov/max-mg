import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { login, selectAuth } from '../store/authSlice'
import { DEFAULT_API_URL } from '../api/greenApi'
import Logo from '../components/Logo'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-max-500 focus:bg-white focus:ring-4 focus:ring-max-100'

export default function LoginPage() {
  const dispatch = useDispatch()
  const { isAuthorized, status, error } = useSelector(selectAuth)
  const [form, setForm] = useState({ idInstance: '', apiTokenInstance: '', apiUrl: DEFAULT_API_URL })

  if (isAuthorized) return <Navigate to="/chats" replace />

  const loading = status === 'loading'
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(
      login({
        idInstance: form.idInstance.trim(),
        apiTokenInstance: form.apiTokenInstance.trim(),
        apiUrl: form.apiUrl.trim() || DEFAULT_API_URL,
      }),
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-max-50 via-white to-[#f4ecff] px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-max-500/10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-4 h-14 w-14 text-2xl" />
          <h1 className="text-2xl font-bold">Вход в MAX</h1>
          <p className="mt-2 text-sm text-gray-500">
            Введите учётные данные инстанса из{' '}
            <a href="https://console.green-api.com" target="_blank" rel="noreferrer" className="text-max-600 hover:underline">
              личного кабинета GREEN-API
            </a>
          </p>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">idInstance</span>
          <input
            name="idInstance"
            value={form.idInstance}
            onChange={onChange}
            placeholder="3100000000"
            inputMode="numeric"
            required
            autoFocus
            className={inputClass}
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">apiTokenInstance</span>
          <input
            name="apiTokenInstance"
            type="password"
            value={form.apiTokenInstance}
            onChange={onChange}
            placeholder="••••••••••••••••"
            required
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">apiUrl</span>
          <input name="apiUrl" value={form.apiUrl} onChange={onChange} required className={inputClass} />
          <span className="mt-1 block text-xs text-gray-400">
            Указан в личном кабинете на странице инстанса, например https://7103.api.greenapi.com
          </span>
        </label>

        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-max-500 py-3 font-semibold text-white transition hover:bg-max-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
