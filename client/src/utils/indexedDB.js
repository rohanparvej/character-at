/**
 * utils/indexedDB.js
 * --------------------
 * Thin wrapper around the browser's native IndexedDB API for guest-mode
 * character storage. This is genuinely new infrastructure (nothing to
 * template from an earlier file), so it's fully built and commented —
 * unlike Character CRUD elsewhere, you won't need to write a parallel
 * version of this yourself.
 *
 * WHY INDEXEDDB AND NOT LOCALSTORAGE:
 * localStorage is synchronous, string-only, and capped around 5-10MB —
 * fine for small flags, bad for a growing list of character objects
 * with nested arrays (tags, dialogues, bookmarks). IndexedDB is async,
 * stores real JS objects, and has a much higher storage ceiling.
 *
 * WHY NOT A LIBRARY (like idb):
 * The native API is verbose but this file hides that verbomity behind
 * simple functions (getAllCharacters, addCharacter, etc.) — a wrapper
 * library would just be doing the same thing with one more dependency.
 * Keeps things 100% FOSS/dependency-free for this piece.
 */

const DB_NAME = 'characterpro'
const DB_VERSION = 1
const STORE_NAME = 'characters'

/**
 * IndexedDB stores data using the browser's "structured clone" algorithm,
 * which does NOT know how to handle Vue's reactive Proxy objects (the
 * kind you get from `reactive({...})` in a form). Passing a reactive
 * object straight into store.add()/put() throws DataCloneError.
 *
 * This strips reactivity by round-tripping through JSON — cheap and
 * reliable for the plain data shapes (strings/numbers/arrays/plain
 * objects) this app stores. Every write function below runs incoming
 * data through this first, so calling code (stores/characters.js,
 * any form) never has to remember to do it themselves.
 */
function toPlainObject(data) {
  return JSON.parse(JSON.stringify(data))
}

/**
 * Opens (or creates, on first run) the IndexedDB database.
 * Returns a Promise that resolves to the open database connection.
 * Every other function in this file calls this first.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Fires only on first-ever open, or when DB_VERSION is bumped —
    // this is where you define the "table" (object store) structure.
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // keyPath: 'id' means each character object must have an `id`
        // field, and IndexedDB uses it as the unique identifier —
        // similar role to Mongo's _id.
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Returns all characters currently stored in this browser.
 */
async function getAllCharacters() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Adds a brand new character. Generates its own `id` (crypto.randomUUID
 * is built into modern browsers — no uuid library needed) and
 * timestamps, so callers just pass the user-entered fields.
 */
async function addCharacter(characterData) {
  const db = await openDB()
  const character = {
    id: crypto.randomUUID(),
    ...toPlainObject(characterData),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.add(character)

    tx.oncomplete = () => resolve(character)
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Updates an existing character by id. Merges the given changes into
 * the existing record rather than requiring the full object every time.
 */
async function updateCharacter(id, changes) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const existing = getRequest.result
      if (!existing) {
        reject(new Error('Character not found.'))
        return
      }
      const updated = { ...existing, ...toPlainObject(changes), updatedAt: new Date().toISOString() }
      const putRequest = store.put(updated)
      putRequest.onsuccess = () => resolve(updated)
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Deletes a character by id.
 */
async function deleteCharacter(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Deletes ALL characters — used by the "delete my local data" privacy
 * feature from your spec (download/delete/re-upload flow).
 */
async function clearAllCharacters() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export default {
  getAllCharacters,
  addCharacter,
  updateCharacter,
  deleteCharacter,
  clearAllCharacters,
}