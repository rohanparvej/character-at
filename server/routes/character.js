/**
 * routes/character.js
 * ----------------------
 * Defines endpoints for /api/characters.
 * Combines reading/export endpoints with write/sync cloud operations.
 */
const express = require('express')
const router = express.Router()
const { exportLibrary, exportSingleCharacter } = require('../controllers/characterExportController')
const { saveSingleCharacter, saveBulkCharacters } = require('../controllers/characterController')
const { requireAuth } = require('../middleware/auth')

// Export / Read operations
router.get('/export', requireAuth, exportLibrary)
router.get('/:id/export', requireAuth, exportSingleCharacter)

// Import / Write / Sync operations
router.post('/', requireAuth, saveSingleCharacter)
router.post('/sync', requireAuth, saveBulkCharacters)

module.exports = router