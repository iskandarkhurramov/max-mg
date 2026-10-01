import Logo from './Logo'

export default function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-chat-bg text-center">
      <Logo className="mb-4 h-16 w-16 text-3xl opacity-90" />
      <h2 className="text-lg font-semibold text-gray-700">Выберите чат</h2>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Откройте существующий диалог или создайте новый по номеру телефона
      </p>
    </div>
  )
}
