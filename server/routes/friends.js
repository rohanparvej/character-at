/**
 * routes/friends.js
 * --------------------
 * Every route here requires requireAuth — guests have no account for
 * friend requests to attach to. Route order matters slightly:
 * /requests/incoming and /requests/outgoing must be defined before
 * /requests/:id/respond would ever be ambiguous with them — they're
 * not actually ambiguous here since the paths differ in segment count,
 * but keeping specific routes above parameterized ones is a good habit
 * (see the TEMPLATE NOTE in routes/character.js for the same point).
 */
const express = require('express')
const router = express.Router()
const {
  sendFriendRequest,
  listIncomingRequests,
  listOutgoingRequests,
  respondToRequest,
  cancelRequest,
  listFriends,
  removeFriend,
} = require('../controllers/friendController')
const { requireAuth } = require('../middleware/auth')

router.post('/request', requireAuth, sendFriendRequest)
router.get('/requests/incoming', requireAuth, listIncomingRequests)
router.get('/requests/outgoing', requireAuth, listOutgoingRequests)
router.post('/requests/:id/respond', requireAuth, respondToRequest)
router.delete('/requests/:id', requireAuth, cancelRequest)

router.get('/', requireAuth, listFriends)
router.delete('/:friendId', requireAuth, removeFriend)

module.exports = router