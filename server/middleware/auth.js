/**
 * middleware/auth.js
 * --------------------
 * `requireAuth` protects any route that needs a logged-in user.
 * Reads the JWT from the httpOnly cookie (set during signup/login),
 * verifies it, and attaches `req.userId` for the controller to use.
 *
 * TEMPLATE NOTE: use this on every route that touches a hosted-mode
 * user's private data — e.g. sending a friend request, creating a
 * card, rating someone. Guest-mode routes (if any exist) skip this
 * entirely since guests aren't authenticated.
 *
 * Usage in a routes file:
 *   router.post('/friend-request', requireAuth, sendFriendRequest)
 */
const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next() // continue to the actual route handler
  } catch (err) {
    // Covers both expired and tampered/invalid tokens.
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }
}

module.exports = { requireAuth }