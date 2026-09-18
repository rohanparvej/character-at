/**
 * services/friendService.js
 * -----------------------------
 * All HTTP calls for the social/friends feature, following the same
 * shape as authService.js and characterService.js — components/store
 * never call apiFetch directly, always go through here.
 */
import { apiFetch } from '../utils/apiClient'

async function searchUsers(query) {
  // encodeURIComponent protects against a username search containing
  // characters that would otherwise break the URL (e.g. "&", "#").
  const { users } = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`, { method: 'GET' })
  return users
}

async function sendFriendRequest(toUserId) {
  return apiFetch('/friends/request', { method: 'POST', body: { toUserId } })
}

async function getIncomingRequests() {
  const { requests } = await apiFetch('/friends/requests/incoming', { method: 'GET' })
  return requests
}

async function getOutgoingRequests() {
  const { requests } = await apiFetch('/friends/requests/outgoing', { method: 'GET' })
  return requests
}

async function respondToRequest(requestId, action) {
  return apiFetch(`/friends/requests/${requestId}/respond`, { method: 'POST', body: { action } })
}

async function cancelRequest(requestId) {
  return apiFetch(`/friends/requests/${requestId}`, { method: 'DELETE' })
}

async function getFriends() {
  const { friends } = await apiFetch('/friends', { method: 'GET' })
  return friends
}

async function removeFriend(friendId) {
  return apiFetch(`/friends/${friendId}`, { method: 'DELETE' })
}

export default {
  searchUsers,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
  getFriends,
  removeFriend,
}