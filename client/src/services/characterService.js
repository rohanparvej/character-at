/**
 * services/characterService.js
 * --------------------------------
 * saveToCloud: still waiting on your characterController.js (the sync
 * endpoint) — see the detailed note further down, unchanged from before.
 *
 * exportLibraryFromCloud / exportSingleCharacterFromCloud: NEW, and
 * these work right now against the export endpoints I built in
 * routes/character.js + controllers/characterExportController.js.
 * They'll just return an empty library until sync exists, since
 * there's nothing in MongoDB to export yet — that's expected, not a bug.
 */
import { apiFetch } from '../utils/apiClient'

async function saveToCloud(character) {
  // ⚠️ BACKEND NOT BUILT YET — THIS IS YOUR PRACTICE PIECE ⚠️
  // Needs POST /api/characters/sync (upsert) in characterController.js,
  // mirroring authController.js's shape: validate → ownership → try/catch.
  //
  // ID GOTCHA TO HANDLE: character.id here is a crypto.randomUUID()
  // string from IndexedDB (see utils/indexedDB.js), NOT a MongoDB
  // ObjectId. Mongo's default _id expects its own ObjectId format, so
  // you have two options in your Character schema:
  //   1. Add a separate `localId: String` field to store this UUID,
  //      and let Mongo generate its own _id as normal — then "upsert"
  //      means findOneAndUpdate({ localId, ownerId }, ..., { upsert: true }).
  //   2. Override _id itself to accept a String instead of ObjectId in
  //      the schema (works, but a bit unconventional for Mongoose).
  // Option 1 is the more common pattern — recommend going with that.
  return apiFetch('/characters/sync', { method: 'POST', body: character })
}

async function exportLibraryFromCloud() {
  const { characters } = await apiFetch('/characters/export', { method: 'GET' })
  return characters
}

async function exportSingleCharacterFromCloud(id) {
  const { character } = await apiFetch(`/characters/${id}/export`, { method: 'GET' })
  return character
}

export default { saveToCloud, exportLibraryFromCloud, exportSingleCharacterFromCloud }