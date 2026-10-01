// Thin client for GREEN-API (MAX). Docs: https://green-api.com/v3/docs/

export const DEFAULT_API_URL = 'https://api.green-api.com'

function buildUrl({ apiUrl, idInstance, apiTokenInstance }, method, suffix = '') {
  const base = (apiUrl || DEFAULT_API_URL).trim().replace(/\/+$/, '')
  return `${base}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!response.ok) {
    let details = ''
    try {
      details = await response.text()
      const json = JSON.parse(details)
      details = [json.message, json.details].filter(Boolean).join(': ') || details
    } catch {
      // body is empty or not JSON — keep the raw text
    }
    // 401 — wrong idInstance/apiTokenInstance; 403 on sendMessage — account temporarily restricted
    const error = new Error(
      response.status === 401
        ? 'Неверный idInstance или apiTokenInstance'
        : `Ошибка GREEN-API (${response.status})${details ? `: ${details}` : ''}`,
    )
    error.status = response.status
    throw error
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export function getStateInstance(credentials) {
  return request(buildUrl(credentials, 'getStateInstance'))
}

export function getSettings(credentials) {
  return request(buildUrl(credentials, 'getSettings'))
}

// HTTP API requires an empty webhookUrl; outgoingWebhook gives delivery/read statuses
export const HTTP_API_SETTINGS = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingWebhook: 'yes',
  stateWebhook: 'yes',
}

export function setSettings(credentials, settings = HTTP_API_SETTINGS) {
  return request(buildUrl(credentials, 'setSettings'), {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

export function checkAccount(credentials, phoneNumber) {
  return request(buildUrl(credentials, 'checkAccount'), {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  })
}

export function sendMessage(credentials, chatId, message) {
  return request(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(credentials, receiveTimeout = 20, signal) {
  return request(buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`), {
    signal,
  })
}

export function deleteNotification(credentials, receiptId) {
  return request(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
}
