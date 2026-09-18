/**
 * stores/characters.js
 * -----------------------
 * Same shape as stores/auth.js: state + loading/error flags + actions
 * that wrap a lower-level module (there it was authService/HTTP calls,
 * here it's the indexedDB utility). Components never touch
 * utils/indexedDB.js directly — always go through this store.
 *
 * TEMPLATE NOTE FOR LATER: once hosted-mode sync exists, this store is
 * where that branching logic will live — e.g. "if logged in, also call
 * characterService.js to persist to Mongo." Not built yet; guest mode
 * (IndexedDB only) is the full scope for now.
 */
import { defineStore } from 'pinia'
import indexedDB from '../utils/indexedDB'

export const useCharacterStore = defineStore('characters', {
  state: () => ({
    characters: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchAll() {
      this.isLoading = true
      this.error = null
      try {
        this.characters = await indexedDB.getAllCharacters()
      } catch (err) {
        this.error = 'Could not load your characters.'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },

    async createCharacter(characterData) {
      const character = await indexedDB.addCharacter(characterData)
      this.characters.push(character)
      return character
    },

    async updateCharacter(id, changes) {
      const updated = await indexedDB.updateCharacter(id, changes)
      // Replace the stale entry in local state with the updated one,
      // rather than re-fetching the whole list from IndexedDB again.
      const index = this.characters.findIndex((c) => c.id === id)
      if (index !== -1) this.characters[index] = updated
      return updated
    },

    async deleteCharacter(id) {
      await indexedDB.deleteCharacter(id)
      this.characters = this.characters.filter((c) => c.id !== id)
    },

    // Convenience getter-as-method — used by CharacterFormView when
    // editing (route has the id, form needs the full object).
    getById(id) {
      return this.characters.find((c) => c.id === id)
    },

    /**
     * Imports an array of already-normalized characters (from
     * utils/importCharacter.js). Runs sequentially (not
     * Promise.all) so the id-collision check below sees each
     * previous import's result — matters if the same file has two
     * characters that happen to share an id, not just collisions
     * against your existing library.
     *
     * Returns a summary so the UI can report exactly what happened,
     * rather than a generic "Import successful."
     */
    async importCharacters(normalizedCharacters) {
      let importedCount = 0
      let renamedCount = 0 // id already existed locally — imported as a new copy instead of overwriting

      for (const character of normalizedCharacters) {
        const idAlreadyExists = this.characters.some((c) => c.id === character.id)
        const toImport = idAlreadyExists ? { ...character, id: crypto.randomUUID() } : character

        if (idAlreadyExists) renamedCount++

        await this.createCharacter(toImport)
        importedCount++
      }

      return { importedCount, renamedCount }
    },
  },
})