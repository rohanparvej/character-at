/**
 * controllers/characterExportController.js
 * --------------------------------------------
 * SCOPE: this file only handles EXPORT (reading + returning data as
 * downloadable JSON). It deliberately does NOT include create/update/
 * delete/sync logic — that's characterController.js, which you're
 * writing yourself using authController.js as the template.
 *
 * Follows the same reference pattern as authController.js:
 * async handlers, try/catch, validate before querying, consistent
 * { error } / { data } response shapes, ownership checks before
 * returning anything private.
 */
const mongoose = require('mongoose')
const Character = require('../models/Character')

/**
 * GET /api/characters/export
 * Returns the requesting user's ENTIRE character library as JSON.
 * Protected by requireAuth — req.userId is set by that middleware.
 */
async function exportLibrary(req, res) {
  try {
    const characters = await Character.find({ ownerId: req.userId })

    // .lean() isn't used here on purpose — we want the full Mongoose
    // documents converted via toJSON so internal fields stay consistent
    // with how exportSingleCharacter formats a single one below.
    res.status(200).json({ characters })
  } catch (err) {
    console.error('Export library error:', err)
    res.status(500).json({ error: 'Could not export your library. Please try again.' })
  }
}

/**
 * GET /api/characters/:id/export
 * Returns ONE character as JSON. Ownership is checked explicitly —
 * a user must never be able to export a character that isn't theirs
 * just by guessing/changing the :id in the URL.
 *
 * :id here is the character's IndexedDB id (see stores/characters.js —
 * every call site passes character.id, the local crypto.randomUUID()),
 * which characterController.js stores as `localId`, NOT Mongo's own
 * _id. We match on localId first; a real ObjectId is also accepted so
 * this keeps working if something ever links to a character by its
 * Mongo _id directly.
 */
async function exportSingleCharacter(req, res) {
  try {
    const { id } = req.params
    const query = { ownerId: req.userId, localId: id }
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ localId: id }, { _id: id }]
      delete query.localId
    }

    const character = await Character.findOne(query)

    if (!character) {
      return res.status(404).json({ error: 'Character not found.' })
    }

    res.status(200).json({ character })
  } catch (err) {
    console.error('Export single character error:', err)
    res.status(500).json({ error: 'Could not export this character. Please try again.' })
  }
}

module.exports = { exportLibrary, exportSingleCharacter }