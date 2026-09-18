/**
 * stores/wall.js
 * -----------------
 * Same shape as the other stores: state + loading/error + actions
 * wrapping wallService calls.
 */
import { defineStore } from 'pinia'
import wallService from '../services/wallService'

export const useWallStore = defineStore('wall', {
  state: () => ({
    myPosts: [],
    // Holds whichever friend's wall is currently being viewed —
    // singular (not keyed by friendId) since only one friend's wall is
    // ever on screen at once (FriendWallView.vue re-fetches on navigation
    // between different friends rather than caching every friend's wall).
    friendWall: { friend: null, posts: [] },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchMyPosts() {
      this.isLoading = true
      this.error = null
      try {
        this.myPosts = await wallService.getMyWallPosts()
      } catch (err) {
        this.error = 'Could not load your wall.'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchFriendWall(friendId) {
      this.isLoading = true
      this.error = null
      try {
        const { friend, posts } = await wallService.getFriendWall(friendId)
        this.friendWall = { friend, posts }
      } catch (err) {
        // Covers both "not your friend" (403) and network errors —
        // FriendWallView shows this.error either way rather than
        // trying to distinguish the reason in the UI.
        this.error = err.response?.data?.error || 'Could not load this wall.'
        this.friendWall = { friend: null, posts: [] }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Builds the snapshot payload from a local character (IndexedDB
     * shape) and posts it. This is where cardVisibility is actually
     * applied — backstory/bookmarks/dialogues are only included if
     * their toggle was on, everything else (name, premise, tags,
     * emojis, type) is always included, matching CardVisibilityModal's
     * "always included on the card" section.
     */
    async postCharacter(character) {
      const visibility = character.cardVisibility || {}

      const payload = {
        characterLocalId: character.id,
        name: character.name,
        premise: character.premise,
        characterType: character.characterType,
        tags: character.tags || [],
        emojis: character.emojis || [],
        backstory: visibility.showBackstory ? character.backstory || '' : '',
        bookmarks: visibility.showBookmarks ? character.bookmarks || [] : [],
        dialogues: visibility.showDialogues ? character.dialogues || [] : [],
      }

      const post = await wallService.postToWall(payload)

      // Replace the existing entry if this character was already
      // posted (matches the backend's upsert), otherwise add it fresh.
      const existingIndex = this.myPosts.findIndex((p) => p.characterLocalId === character.id)
      if (existingIndex !== -1) {
        this.myPosts[existingIndex] = post
      } else {
        this.myPosts.unshift(post)
      }

      return post
    },

    async deletePost(postId) {
      await wallService.deleteWallPost(postId)
      this.myPosts = this.myPosts.filter((p) => p._id !== postId)
    },

    // Finds a post by id in whichever list currently holds it (own
    // wall vs. a friend's wall — both structures use the same _id) and
    // merges the given field updates into it. Shared by ratePost and
    // reactToPost below so neither has to duplicate this lookup.
    _patchPost(postId, changes) {
      const inMine = this.myPosts.find((p) => p._id === postId)
      if (inMine) Object.assign(inMine, changes)

      const inFriendWall = this.friendWall.posts.find((p) => p._id === postId)
      if (inFriendWall) Object.assign(inFriendWall, changes)
    },

    async ratePost(postId, score) {
      const result = await wallService.ratePost(postId, score)
      // result = { avgRating, ratingCount, myRating }
      this._patchPost(postId, result)
    },

    async reactToPost(postId) {
      const result = await wallService.toggleReaction(postId)
      // result = { reactionCount, iReacted }
      this._patchPost(postId, result)
    },
  },
})