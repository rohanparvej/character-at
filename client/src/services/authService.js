/**
 * services/authService.js
 * --------------------------
 * All HTTP calls related to auth. The apiFetch wrapper itself now
 * lives in utils/apiClient.js (shared with characterService.js) —
 * this file just calls it with auth-specific paths/bodies.
 */
import { apiFetch } from '../utils/apiClient'

async function signup({ username, email, password }) {
  return apiFetch('/auth/signup', { method: 'POST', body: { username, email, password } })
}

async function login({ emailOrUsername, password }) {
  return apiFetch('/auth/login', { method: 'POST', body: { emailOrUsername, password } })
}

async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

async function getCurrentUser() {
  return apiFetch('/auth/me', { method: 'GET' })
}

async function updateProfile({ username, email }) {
  return apiFetch('/auth/me', { method: 'PUT', body: { username, email } })
}

export default { signup, login, logout, getCurrentUser, updateProfile }