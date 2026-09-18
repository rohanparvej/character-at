/**
 * routes/character.js
 * ----------------------
 * Currently only wires up the export endpoints. When you write
 * characterController.js (create/update/delete/sync), add those
 * routes to this SAME file — don't create a separate routes file for
 * them, since they all operate on the same /api/characters resource.
 *
 * Example of what you'll add:
 *   router.post('/sync', requireAuth, syncCharacter)
 *   router.delete('/:id', requireAuth, deleteCharacter)
 */
const express = require('express')
const router = express.Router()
const { exportLibrary, exportSingleCharacter } = require('../controllers/characterExportController')
const { requireAuth } = require('../middleware/auth')

// Both require login — guests have no server-side library to export from.
router.get('/export', requireAuth, exportLibrary)
router.get('/:id/export', requireAuth, exportSingleCharacter)

module.exports = router