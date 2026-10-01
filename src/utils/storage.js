const AUTH_KEY = 'max-chat:auth'
const chatsKey = (idInstance) => `max-chat:chats:${idInstance}`

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage may be unavailable (private mode, quota) — the app still works in memory
  }
}

export const loadAuth = () => read(AUTH_KEY)
export const saveAuth = (auth) => write(AUTH_KEY, auth)
export const loadChats = (idInstance) => (idInstance ? read(chatsKey(idInstance)) : null)
export const saveChats = (idInstance, chats) => idInstance && write(chatsKey(idInstance), chats)
