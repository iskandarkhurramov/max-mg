export function normalizePhone(value) {
  return value.replace(/\D/g, '')
}

export function formatPhone(phone) {
  const d = normalizePhone(phone || '')
  if (d.length === 11 && d.startsWith('7')) {
    return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`
  }
  return d ? `+${d}` : ''
}

export function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatChatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (date.toDateString() === new Date().toDateString()) return formatTime(timestamp)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export function formatDayLabel(timestamp) {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function initials(name) {
  const words = (name || '').replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/)
  const letters = words.slice(0, 2).map((w) => w[0] ?? '').join('')
  return (letters || '#').toUpperCase()
}

const AVATAR_COLORS = ['#5b5bf7', '#e0567c', '#2bb39a', '#f29a3a', '#3a9bf2', '#9b59d0', '#d65745']

export function avatarColor(seed = '') {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
