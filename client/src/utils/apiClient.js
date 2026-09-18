/**
 * utils/apiClient.js
 * ---------------------
 * Shared fetch wrapper — originally lived only inside authService.js,
 * pulled out here so characterService.js (and any future service) can
 * reuse the exact same request/error handling instead of copy-pasting it.
 *
 * TEMPLATE NOTE: every new *Service.js file should import apiFetch from
 * here rather than calling fetch() directly.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends the httpOnly auth cookie
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.')
    error.response = { data, status: response.status }
    throw error
  }

  return data
}