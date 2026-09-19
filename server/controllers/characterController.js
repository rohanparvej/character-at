/**
 * controllers/characterController.js
 * --------------------------------------
 * Handles cloud persistence (saving and bulk syncing) for characters.
 * Follows reference pattern in authController.js:
 * 1. Async try/catch handlers.
 * 2. Strict input validation prior to database interaction.
 * 3. Enforces user ownership via req.userId.
 * 4. Consistent response shapes { error } or { character(s) }.
 */
const Character = require('../models/Character')

/**
 * Helper to validate basic character fields before touching the database.
 */
function validateCharacterPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Invalid character payload.'
  }
  if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
    return 'Character name is required.'
  }
  // localId (payload.id, from IndexedDB) is what ties this cloud row
  // back to a specific local character on the next sync — without it
  // we'd have no reliable way to update instead of duplicate.
  if (!payload.id && !payload.localId) {
    return 'Character is missing its local id.'
  }
  return null
}

/**
 * Helper to sanitize character payload and attach ownerId.
 *
 * `localId` carries over the IndexedDB id (payload.id — see
 * utils/indexedDB.js) so this cloud row can be matched back to the
 * exact local character on every future save, instead of the
 * mongoose.Types.ObjectId check further down (which never matched,
 * since a crypto.randomUUID() string is never a valid ObjectId —
 * every "save" was silently falling through to "create new").
 */
function sanitizeCharacterData(payload, ownerId) {
  return {
    ownerId,
    localId: payload.id || payload.localId || undefined,
    name: payload.name.trim(),
    premise: payload.premise || '',
    characterType: payload.characterType || '',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    emojis: Array.isArray(payload.emojis) ? payload.emojis : [],
    backstory: payload.backstory || '',
    bookmarks: Array.isArray(payload.bookmarks)
      ? payload.bookmarks.filter((b) => b && b.label).map((b) => ({ label: b.label, note: b.note || '' }))
      : [],
    dialogues: Array.isArray(payload.dialogues)
      ? payload.dialogues.filter((d) => d && d.text).map((d) => ({ text: d.text, note: d.note || '' }))
      : [],
  }
}

/**
 * POST /api/characters
 * Saves or updates a single character in MongoDB for the logged-in user.
 * Matched by { ownerId, localId } — localId is the character's
 * crypto.randomUUID() id from IndexedDB (see sanitizeCharacterData),
 * not Mongo's own _id — so calling this again for the same local
 * character updates the same cloud row instead of creating a new one.
 */
async function saveSingleCharacter(req, res) {
  try {
    const error = validateCharacterPayload(req.body)
    if (error) return res.status(400).json({ error })

    const characterData = sanitizeCharacterData(req.body, req.userId)

    const saved = await Character.findOneAndUpdate(
      { ownerId: req.userId, localId: characterData.localId },
      characterData,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ character: saved })
  } catch (err) {
    console.error('Save single character error:', err)
    res.status(500).json({ error: 'Could not save character to cloud.' })
  }
}

/**
 * POST /api/characters/sync
 * Bulk syncs an array of local characters to MongoDB for the current user.
 * Same { ownerId, localId } upsert as saveSingleCharacter, one item at a
 * time — this is the "Export My Library (Cloud)"-adjacent "push my whole
 * local library" action (see stores/characters.js's saveAllToCloud).
 */
async function saveBulkCharacters(req, res) {
  try {
    const { characters } = req.body

    if (!Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: 'An array of characters is required.' })
    }

    const savedCharacters = []

    for (const item of characters) {
      const error = validateCharacterPayload(item)
      if (error) {
        return res.status(400).json({ error: `Invalid character item: ${error}` })
      }

      const characterData = sanitizeCharacterData(item, req.userId)

      const saved = await Character.findOneAndUpdate(
        { ownerId: req.userId, localId: characterData.localId },
        characterData,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      )
      savedCharacters.push(saved)
    }

    res.status(200).json({
      message: `${savedCharacters.length} character(s) synced successfully.`,
      characters: savedCharacters,
    })
  } catch (err) {
    console.error('Save bulk characters error:', err)
    res.status(500).json({ error: 'Could not sync characters to cloud.' })
  }
}

module.exports = {
  saveSingleCharacter,
  saveBulkCharacters,
}