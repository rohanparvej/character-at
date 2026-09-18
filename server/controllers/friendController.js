/**
 * controllers/friendController.js
 * -----------------------------------
 * Handles the whole social/friends feature: searching for users,
 * sending/accepting/declining/cancelling friend requests, and
 * listing/removing friends.
 *
 * Follows the same reference pattern as authController.js: async
 * handlers, try/catch, validate before querying, ownership checks
 * before acting, consistent { error } / { data } response shapes.
 * Every route here requires requireAuth (see routes/friends.js and
 * routes/users.js) — guests have no server-side identity to befriend
 * anyone with.
 */
const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

/**
 * GET /api/users/search?q=<text>
 * Finds other users by username (partial, case-insensitive match).
 * For each result, also figures out the CURRENT relationship status
 * so the frontend can show the right button (Send Request / Pending /
 * Already Friends) without a separate round-trip per result.
 */
async function searchUsers(req, res) {
  try {
    const query = (req.query.q || '').trim()
    if (query.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters.' })
    }

    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ error: 'User not found.' })

    // Case-insensitive partial match, excluding yourself. Capped at 15
    // results — this is a "find your friend" search box, not a full
    // user directory browser, so it doesn't need pagination.
    const matches = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.userId },
    }).limit(15)

    if (matches.length === 0) {
      return res.status(200).json({ users: [] })
    }

    const matchIds = matches.map((u) => u._id)

    // One query for all outgoing pending requests FROM me TO any of
    // these matches, and one for incoming pending requests FROM any of
    // these matches TO me — cheaper than N queries (one per result).
    const [outgoingPending, incomingPending] = await Promise.all([
      FriendRequest.find({ fromUserId: req.userId, toUserId: { $in: matchIds }, status: 'pending' }),
      FriendRequest.find({ fromUserId: { $in: matchIds }, toUserId: req.userId, status: 'pending' }),
    ])
    const outgoingToIds = new Set(outgoingPending.map((r) => r.toUserId.toString()))
    const incomingFromIds = new Set(incomingPending.map((r) => r.fromUserId.toString()))
    const friendIds = new Set(me.friends.map((id) => id.toString()))

    // Attach a single `relationshipStatus` field per result: exactly
    // one of these four states, so the frontend's button logic is a
    // simple switch rather than checking multiple booleans itself.
    const users = matches.map((user) => {
      const id = user._id.toString()
      let relationshipStatus = 'none'
      if (friendIds.has(id)) relationshipStatus = 'friend'
      else if (outgoingToIds.has(id)) relationshipStatus = 'pending_outgoing'
      else if (incomingFromIds.has(id)) relationshipStatus = 'pending_incoming'

      return { id: user._id, username: user.username, relationshipStatus }
    })

    res.status(200).json({ users })
  } catch (err) {
    console.error('Search users error:', err)
    res.status(500).json({ error: 'Could not search users right now.' })
  }
}

/**
 * POST /api/friends/request
 * Body: { toUserId }
 * Sends a friend request. Has one nice-to-have built in: if the OTHER
 * person already sent you a pending request, this auto-accepts that
 * one instead of creating a redundant second pending request in the
 * opposite direction — matches how most social apps handle "you both
 * wanted to connect."
 */
async function sendFriendRequest(req, res) {
  try {
    const { toUserId } = req.body
    if (!toUserId) return res.status(400).json({ error: 'toUserId is required.' })
    if (toUserId === req.userId) return res.status(400).json({ error: 'You cannot send yourself a friend request.' })

    const targetUser = await User.findById(toUserId)
    if (!targetUser) return res.status(404).json({ error: 'User not found.' })

    const me = await User.findById(req.userId)
    if (me.friends.some((id) => id.toString() === toUserId)) {
      return res.status(409).json({ error: 'You are already friends with this user.' })
    }

    // Check both directions — a pending request already exists either way.
    const existingOutgoing = await FriendRequest.findOne({ fromUserId: req.userId, toUserId, status: 'pending' })
    if (existingOutgoing) {
      return res.status(409).json({ error: 'You already sent a request to this user.' })
    }

    const existingIncoming = await FriendRequest.findOne({ fromUserId: toUserId, toUserId: req.userId, status: 'pending' })
    if (existingIncoming) {
      // They already asked YOU — auto-accept instead of creating a
      // second, redundant pending request. Reuses the same friending
      // logic as respondToRequest's accept branch below.
      await User.findByIdAndUpdate(req.userId, { $addToSet: { friends: toUserId } })
      await User.findByIdAndUpdate(toUserId, { $addToSet: { friends: req.userId } })
      await FriendRequest.findByIdAndDelete(existingIncoming._id)
      return res.status(200).json({ message: 'You are now friends.', autoAccepted: true })
    }

    await FriendRequest.create({ fromUserId: req.userId, toUserId })
    res.status(201).json({ message: 'Friend request sent.' })
  } catch (err) {
    console.error('Send friend request error:', err)
    res.status(500).json({ error: 'Could not send friend request right now.' })
  }
}

/**
 * GET /api/friends/requests/incoming
 * Pending requests sent TO the current user — the ones they need to respond to.
 */
async function listIncomingRequests(req, res) {
  try {
    const requests = await FriendRequest.find({ toUserId: req.userId, status: 'pending' })
      .populate('fromUserId', 'username') // pulls in just the username, not the whole User document
      .sort({ createdAt: -1 })

    res.status(200).json({
      requests: requests.map((r) => ({
        id: r._id,
        fromUser: { id: r.fromUserId._id, username: r.fromUserId.username },
        createdAt: r.createdAt,
      })),
    })
  } catch (err) {
    console.error('List incoming requests error:', err)
    res.status(500).json({ error: 'Could not load incoming requests.' })
  }
}

/**
 * GET /api/friends/requests/outgoing
 * Pending requests the current user sent — shown as "waiting for a response."
 */
async function listOutgoingRequests(req, res) {
  try {
    const requests = await FriendRequest.find({ fromUserId: req.userId, status: 'pending' })
      .populate('toUserId', 'username')
      .sort({ createdAt: -1 })

    res.status(200).json({
      requests: requests.map((r) => ({
        id: r._id,
        toUser: { id: r.toUserId._id, username: r.toUserId.username },
        createdAt: r.createdAt,
      })),
    })
  } catch (err) {
    console.error('List outgoing requests error:', err)
    res.status(500).json({ error: 'Could not load outgoing requests.' })
  }
}

/**
 * POST /api/friends/requests/:id/respond
 * Body: { action: 'accept' | 'decline' }
 * Only the RECIPIENT of a request can respond to it — this ownership
 * check (toUserId must match req.userId) is what stops someone from
 * accepting/declining a request that isn't addressed to them.
 */
async function respondToRequest(req, res) {
  try {
    const { action } = req.body
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: "action must be 'accept' or 'decline'." })
    }

    const request = await FriendRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ error: 'Friend request not found.' })

    if (request.toUserId.toString() !== req.userId) {
      return res.status(403).json({ error: 'This request is not addressed to you.' })
    }
    if (request.status !== 'pending') {
      return res.status(409).json({ error: 'This request has already been resolved.' })
    }

    if (action === 'accept') {
      // $addToSet instead of $push — adds the id only if it isn't
      // already there, so this can never create duplicate entries in
      // either user's friends array even if called twice by mistake.
      await User.findByIdAndUpdate(request.fromUserId, { $addToSet: { friends: request.toUserId } })
      await User.findByIdAndUpdate(request.toUserId, { $addToSet: { friends: request.fromUserId } })
    }

    // Whether accepted or declined, the request itself is resolved —
    // delete it rather than keeping a stale record around (see the
    // DESIGN NOTE at the top of models/FriendRequest.js).
    await FriendRequest.findByIdAndDelete(request._id)

    res.status(200).json({ message: action === 'accept' ? 'Friend request accepted.' : 'Friend request declined.' })
  } catch (err) {
    console.error('Respond to request error:', err)
    res.status(500).json({ error: 'Could not respond to this request.' })
  }
}

/**
 * DELETE /api/friends/requests/:id
 * Cancels a PENDING request the current user sent. Ownership check
 * here is the opposite of respondToRequest's — only the SENDER
 * (fromUserId) can cancel their own outgoing request.
 */
async function cancelRequest(req, res) {
  try {
    const request = await FriendRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ error: 'Friend request not found.' })

    if (request.fromUserId.toString() !== req.userId) {
      return res.status(403).json({ error: 'You did not send this request.' })
    }

    await FriendRequest.findByIdAndDelete(request._id)
    res.status(200).json({ message: 'Friend request cancelled.' })
  } catch (err) {
    console.error('Cancel request error:', err)
    res.status(500).json({ error: 'Could not cancel this request.' })
  }
}

/**
 * GET /api/friends
 * Lists the current user's friends. Only returns username — email
 * stays private even between friends, since nothing in the product
 * spec requires sharing it, and it's safer to default to less exposure.
 */
async function listFriends(req, res) {
  try {
    const me = await User.findById(req.userId).populate('friends', 'username')
    if (!me) return res.status(404).json({ error: 'User not found.' })

    res.status(200).json({
      friends: me.friends.map((f) => ({ id: f._id, username: f.username })),
    })
  } catch (err) {
    console.error('List friends error:', err)
    res.status(500).json({ error: 'Could not load your friends list.' })
  }
}

/**
 * DELETE /api/friends/:friendId
 * Unfriends someone — removes each user from the other's friends
 * array. Not explicitly requested, but included as the natural
 * counterpart to adding a friend; flagging it here since it goes
 * slightly beyond your literal ask.
 */
async function removeFriend(req, res) {
  try {
    const { friendId } = req.params

    await User.findByIdAndUpdate(req.userId, { $pull: { friends: friendId } })
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.userId } })

    res.status(200).json({ message: 'Friend removed.' })
  } catch (err) {
    console.error('Remove friend error:', err)
    res.status(500).json({ error: 'Could not remove this friend.' })
  }
}

module.exports = {
  searchUsers,
  sendFriendRequest,
  listIncomingRequests,
  listOutgoingRequests,
  respondToRequest,
  cancelRequest,
  listFriends,
  removeFriend,
}