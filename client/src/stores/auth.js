/**
 * stores/auth.js
 * ----------------
 * Pinia store for auth state. Components read `user`/`isAuthenticated`
 * from here — they never call authService directly, they call this
 * store's actions, which call authService. Keeps a single source of
 * truth for "who is logged in right now."
 *
 * TEMPLATE NOTE: stores/characters.js will follow the same shape —
 * state + loading/error flags + actions that wrap a service call.
 */
import { defineStore } from 'pinia'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { id, username, email } or null if logged out
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async signup(formData) {
      this.isLoading = true
      this.error = null
      try {
        const { user } = await authService.signup(formData)
        this.user = user
      } catch (err) {
        // err.response.data.error is the message shape our backend
        // controllers return — see authController.js's res.status(x).json({ error })
        this.error = err.response?.data?.error || 'Signup failed. Please try again.'
        throw err // re-throw so the calling component can react too (e.g. keep form filled in)
      } finally {
        this.isLoading = false
      }
    },

    async login(formData) {
      this.isLoading = true
      this.error = null
      try {
        const { user } = await authService.login(formData)
        this.user = user
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed. Please try again.'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      await authService.logout()
      this.user = null
    },

    async updateProfile(formData) {
      this.isLoading = true
      this.error = null
      try {
        const { user } = await authService.updateProfile(formData)
        this.user = user // replaces with the server's confirmed version
        return user
      } catch (err) {
        this.error = err.response?.data?.error || 'Could not update your profile.'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Called once when the app loads, to check if a valid session
    // cookie already exists (e.g. user refreshed the page).
    async fetchCurrentUser() {
      try {
        const { user } = await authService.getCurrentUser()
        this.user = user
      } catch {
        this.user = null // no valid session — that's fine, not an error to surface
      }
    },
  },
})