/**
 * stores/friends.js
 * --------------------
 * Same shape as stores/characters.js and stores/auth.js: state +
 * loading/error flags + actions that wrap friendService calls.
 * FriendsView.vue reads from this store rather than calling
 * friendService directly.
 */
import { defineStore } from 'pinia'
import friendService from '../services/friendService'

export const useFriendStore = defineStore('friends', {
  state: () => ({
    friends: [],
    incomingRequests: [],
    outgoingRequests: [],
    searchResults: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // Loads all three lists at once — called when FriendsView mounts,
    // so the page shows a complete picture immediately rather than
    // three separate loading flickers.
    async fetchAll() {
      this.isLoading = true
      this.error = null
      try {
        const [friends, incoming, outgoing] = await Promise.all([
          friendService.getFriends(),
          friendService.getIncomingRequests(),
          friendService.getOutgoingRequests(),
        ])
        this.friends = friends
        this.incomingRequests = incoming
        this.outgoingRequests = outgoing
      } catch (err) {
        this.error = 'Could not load your friends and requests.'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },

    async searchUsers(query) {
      try {
        this.searchResults = await friendService.searchUsers(query)
      } catch (err) {
        this.error = err.response?.data?.error || 'Search failed.'
        this.searchResults = []
      }
    },

    clearSearch() {
      this.searchResults = []
    },

    async sendRequest(toUserId) {
      const result = await friendService.sendFriendRequest(toUserId)
      // Refresh outgoing requests (or friends, if it auto-accepted) so
      // the UI reflects the new state without a full page reload.
      await this.fetchAll()
      // Update the search result's relationshipStatus in place too, so
      // the button in the search list changes immediately.
      const target = this.searchResults.find((u) => u.id === toUserId)
      if (target) target.relationshipStatus = result.autoAccepted ? 'friend' : 'pending_outgoing'
      return result
    },

    async respondToRequest(requestId, action) {
      await friendService.respondToRequest(requestId, action)
      await this.fetchAll()
    },

    async cancelRequest(requestId) {
      await friendService.cancelRequest(requestId)
      this.outgoingRequests = this.outgoingRequests.filter((r) => r.id !== requestId)
    },

    async removeFriend(friendId) {
      await friendService.removeFriend(friendId)
      this.friends = this.friends.filter((f) => f.id !== friendId)
    },
  },
})