import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkInstanceSettings, fixInstanceSettings, selectAuth } from '../store/authSlice'

/** Warns when the instance is not set up for the HTTP API (webhookUrl must be empty). */
export default function SettingsBanner() {
  const dispatch = useDispatch()
  const { settingsStatus } = useSelector(selectAuth)

  useEffect(() => {
    dispatch(checkInstanceSettings())
  }, [dispatch])

  if (settingsStatus !== 'misconfigured' && settingsStatus !== 'saving') return null

  return (
    <div className="mx-4 mb-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
      <p className="mb-2">
        Инстанс не настроен для HTTP API: в настройках указан <code>webhookUrl</code> или отключены входящие
        уведомления. Новые сообщения не будут приходить.
      </p>
      <button
        onClick={() => dispatch(fixInstanceSettings())}
        disabled={settingsStatus === 'saving'}
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
      >
        {settingsStatus === 'saving' ? 'Сохраняем…' : 'Настроить автоматически'}
      </button>
    </div>
  )
}
