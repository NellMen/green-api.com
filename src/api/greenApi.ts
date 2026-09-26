import type {
  CheckAccountResponse,
  Credentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types'

function resolveApiBase(apiUrl: string): string {
  const base = apiUrl.replace(/\/$/, '')

  // In Vite dev, route through local proxy to avoid CORS.
  if (import.meta.env.DEV) {
    return '/green-api-proxy'
  }

  return base
}

function buildUrl(
  credentials: Credentials,
  method: string,
  suffix = '',
): string {
  const base = resolveApiBase(credentials.apiUrl)
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`
}

function requestHeaders(credentials: Credentials): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (import.meta.env.DEV) {
    headers['X-Green-Api-Url'] = credentials.apiUrl.replace(/\/$/, '')
  }

  return headers
}

async function parseError(response: Response): Promise<never> {
  const text = await response.text()
  let message = text || response.statusText

  try {
    const json = JSON.parse(text) as { message?: string; error?: string }
    message = json.message || json.error || message
  } catch {
    // keep raw text
  }

  throw new Error(message || `HTTP ${response.status}`)
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
): Promise<CheckAccountResponse> {
  const response = await fetch(buildUrl(credentials, 'checkAccount'), {
    method: 'POST',
    headers: requestHeaders(credentials),
    body: JSON.stringify({ phoneNumber }),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return response.json() as Promise<CheckAccountResponse>
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await fetch(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: requestHeaders(credentials),
    body: JSON.stringify({ chatId, message }),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return response.json() as Promise<SendMessageResponse>
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 5,
): Promise<ReceiveNotificationResponse> {
  const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  const response = await fetch(url, {
    method: 'GET',
    headers: requestHeaders(credentials),
  })

  if (!response.ok) {
    await parseError(response)
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text) as ReceiveNotificationResponse
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    buildUrl(credentials, 'deleteNotification', `/${receiptId}`),
    {
      method: 'DELETE',
      headers: requestHeaders(credentials),
    },
  )

  if (!response.ok) {
    await parseError(response)
  }
}
