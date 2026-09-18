/**
 * routes/auth.js
 * ----------------
 * Maps HTTP endpoints to controller functions. This file should stay
 * thin — no logic here, just wiring. If you find yourself writing an
 * `if` statement in a routes file, that logic belongs in the controller.
 *
 * TEMPLATE NOTE: routes/character.js, routes/card.js, etc. should
 * follow this exact shape — import controller, define endpoints,
 * apply requireAuth where the route needs a logged-in user.
 */
const express = require('express')
const router = express.Router()
const { signup, login, logout, getCurrentUser, updateProfile } = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

// Protected — only works if the request carries a valid JWT cookie.
router.get('/me', requireAuth, getCurrentUser)
router.put('/me', requireAuth, updateProfile)

module.exports = router