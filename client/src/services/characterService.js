/**
 * services/characterService.js
 * --------------------------------
 * saveToCloud: pushes ONE local character up to MongoDB —
 * POST /api/characters (characterController.js's saveSingleCharacter).
 * saveLibraryToCloud: pushes the WHOLE local library up in one call —
 * POST /api/characters/sync (saveBulkCharacters). Both upsert by the
 * character's IndexedDB id (sent as `id` in the body, stored server-side
 * as `localId`), so calling either again for the same character updates
 * its existing cloud row instead of creating a duplicate.
 *
 * exportLibraryFromCloud / exportSingleCharacterFromCloud: read the
 * other direction — pull what's already in MongoDB back down as JSON,
 * against the export endpoints in controllers/characterExportController.js.
 */
import { apiFetch } from '../utils/apiClient'

async function saveToCloud(character) {
  const { character: saved } = await apiFetch('/characters', { method: 'POST', body: character })
  return saved
}

async function saveLibraryToCloud(characters) {
  const { characters: saved, message } = await apiFetch('/characters/sync', {
    method: 'POST',
    body: { characters },
  })
  return { characters: saved, message }
}

async function exportLibraryFromCloud() {
  const { characters } = await apiFetch('/characters/export', { method: 'GET' })
  return characters
}

async function exportSingleCharacterFromCloud(id) {
  const { character } = await apiFetch(`/characters/${id}/export`, { method: 'GET' })
  return character
}

export default {
  saveToCloud,
  saveLibraryToCloud,
  exportLibraryFromCloud,
  exportSingleCharacterFromCloud,
}