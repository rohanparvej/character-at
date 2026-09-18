/**
 * services/wallService.js
 * ---------------------------
 * HTTP calls for the wall feature. Same shape as the other *Service.js
 * files — components/store never call apiFetch directly.
 */
import { apiFetch } from '../utils/apiClient'

async function postToWall(payload) {
  const { post } = await apiFetch('/wall/posts', { method: 'POST', body: payload })
  return post
}

async function getMyWallPosts() {
  const { posts } = await apiFetch('/wall/posts/mine', { method: 'GET' })
  return posts
}

async function deleteWallPost(postId) {
  return apiFetch(`/wall/posts/${postId}`, { method: 'DELETE' })
}

async function getFriendWall(friendId) {
  // Returns { friend, posts } — see stores/wall.js for how both are used.
  return apiFetch(`/wall/friend/${friendId}`, { method: 'GET' })
}

async function ratePost(postId, score) {
  return apiFetch(`/wall/posts/${postId}/rate`, { method: 'POST', body: { score } })
}

async function toggleReaction(postId) {
  return apiFetch(`/wall/posts/${postId}/react`, { method: 'POST' })
}

export default { postToWall, getMyWallPosts, deleteWallPost, getFriendWall, ratePost, toggleReaction }