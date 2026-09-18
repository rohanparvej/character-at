/**
 * routes/users.js
 * -----------------
 * Separate from routes/friends.js on purpose: this is about USERS in
 * general (currently just search), while friends.js is about the
 * RELATIONSHIP between users. If you add more general user-lookup
 * endpoints later (e.g. viewing a public profile), they belong here too.
 */
const express = require('express')
const router = express.Router()
const { searchUsers } = require('../controllers/friendController')
const { requireAuth } = require('../middleware/auth')

router.get('/search', requireAuth, searchUsers)

module.exports = router