/**
 * utils/importCharacter.js
 * ---------------------------
 * Parses and normalizes character data from an exported JSON file so
 * it can be handed to stores/characters.js for import. Handles BOTH
 * export shapes this app produces:
 *   - Single character (local "Export to File" button — IndexedDB
 *     shape, uses `id`, bookmarks/dialogues use `id`)
 *   - Whole library array (cloud "Export My Library" button — Mongo
 *     shape, uses `_id`, includes `ownerId`/`__v`, subdocuments use `_id`)
 * Either shape normalizes into exactly what utils/indexedDB.js expects.
 */

// Turns raw parsed JSON into an array, regardless of whether the file
// held one character (an object) or many (an array).
function toCharacterArray(parsed) {
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object') return [parsed]
  return []
}

// Converts a bookmark/dialogue subdocument from either shape into the
// local shape: `_id` → `id`, keep only the fields that matter, drop
// anything Mongo-specific.
function normalizeSubItem(item, fields) {
  const normalized = {
    id: item.id || (item._id ? String(item._id) : crypto.randomUUID()),
  }
  for (const field of fields) {
    normalized[field] = item[field] ?? ''
  }
  return normalized
}

/**
 * Normalizes ONE character object — whichever shape it came from —
 * into exactly what utils/indexedDB.js's addCharacter expects.
 * Deliberately does NOT carry over ownerId, __v, or Mongo's own
 * createdAt/updatedAt — ownerId is meaningless locally, and timestamps
 * get regenerated fresh on import (kept simple on purpose; "preserve
 * original creation date" would need a small addCharacter change and
 * isn't essential for this feature).
 */
export function normalizeCharacter(raw) {
  return {
    id: raw.id || (raw._id ? String(raw._id) : crypto.randomUUID()),
    name: raw.name || 'Untitled Character',
    premise: raw.premise || '',
    characterType: raw.characterType || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    emojis: Array.isArray(raw.emojis) ? raw.emojis : [],
    backstory: raw.backstory || '',
    bookmarks: Array.isArray(raw.bookmarks)
      ? raw.bookmarks.map((b) => normalizeSubItem(b, ['label', 'note']))
      : [],
    dialogues: Array.isArray(raw.dialogues)
      ? raw.dialogues.map((d) => normalizeSubItem(d, ['text', 'note']))
      : [],
  }
}

/**
 * Reads a File object (from an <input type="file"> change event),
 * parses it as JSON, validates it loosely, and returns a normalized
 * array of characters ready for stores/characters.js's
 * importCharacters action. Throws a descriptive Error for anything
 * that isn't usable, so the calling code can show it directly.
 */
export async function parseCharacterImportFile(file) {
  const text = await file.text()

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  const rawCharacters = toCharacterArray(parsed)
  if (rawCharacters.length === 0) {
    throw new Error('No character data found in that file.')
  }

  // Minimal validation — every entry needs at least a name to be
  // worth importing. Silently drop entries that don't qualify rather
  // than failing the whole import over one bad entry in a big library file.
  const valid = rawCharacters.filter((c) => c && typeof c === 'object' && c.name)
  if (valid.length === 0) {
    throw new Error('The file did not contain any recognizable characters.')
  }

  return valid.map(normalizeCharacter)
}