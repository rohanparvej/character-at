/**
 * utils/exportCharacter.js
 * ---------------------------
 * Pure client-side download logic — no backend involved. Two entry
 * points: exporting a single character, and exporting a whole array
 * (used for the cloud "export my library" case, and reusable later
 * for a "download all my local characters" privacy feature too).
 */

/**
 * Generic helper: turns any JSON-serializable data into a downloaded
 * file. Both functions below call this — it's the one place that
 * actually touches the DOM/Blob APIs.
 */
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2) // pretty-printed, human-readable if opened
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url) // free the memory now that the download has started
}

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/**
 * Exports ONE character — used by the local "Export to File" button
 * (reads from IndexedDB/store state, no backend call) and can also be
 * called with a character fetched from the cloud export endpoint.
 */
export function exportCharacterAsFile(character) {
  const safeName = slugify(character.name || 'character')
  downloadJSON(character, `${safeName}.json`)
}

/**
 * Exports a whole array of characters as one file — used by the
 * "Export Library (Cloud)" button.
 */
export function exportLibraryAsFile(characters) {
  downloadJSON(characters, `characterAt-library-${new Date().toISOString().slice(0, 10)}.json`)
}