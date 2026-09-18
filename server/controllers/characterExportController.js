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
 */
async function exportSingleCharacter(req, res) {
  try {
    const character = await Character.findById(req.params.id)

    if (!character) {
      return res.status(404).json({ error: 'Character not found.' })
    }

    // Ownership check — this is the same pattern you'll need in
    // characterController.js for update/delete too: fetch first,
    // THEN compare ownerId, THEN act. Never trust the :id alone.
    if (character.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'You do not have access to this character.' })
    }

    res.status(200).json({ character })
  } catch (err) {
    console.error('Export single character error:', err)
    res.status(500).json({ error: 'Could not export this character. Please try again.' })
  }
}

module.exports = { exportLibrary, exportSingleCharacter }