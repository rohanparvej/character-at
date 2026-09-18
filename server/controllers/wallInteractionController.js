/**
 * controllers/wallInteractionController.js
 * ---------------------------------------------
 * Rating and reacting to wall posts. Separate file from
 * wallController.js since that one owns posts themselves (create/
 * list/delete) while this one owns OTHER people's interactions with
 * those posts — different enough responsibilities to keep apart.
 *
 * Both endpoints share the same access rule as viewing a wall at all
 * (see canAccessPost below): you can only rate/react to a post if
 * you're the owner or their friend. Same boundary, enforced again
 * here rather than assumed — a viewer reaching this endpoint didn't
 * necessarily go through getFriendWall first (e.g. a stale page, or
 * someone hitting the API directly), so the check has to be real here
 * too, not just on the listing endpoint.
 */
const User = require('../models/User')
const WallPost = require('../models/WallPost')
const WallPostRating = require('../models/WallPostRating')
const WallPostReaction = require('../models/WallPostReaction')
const { attachInteractionData } = require('../utils/wallAggregation')

/**
 * Shared access check: can `viewerId` interact with a post owned by `ownerId`?
 * Mirrors getFriendWall's rule in wallController.js — owner themselves,
 * or an accepted friend of the owner.
 */
async function canAccessPost(viewerId, ownerId) {
  if (viewerId === ownerId.toString()) return true
  const viewer = await User.findById(viewerId)
  if (!viewer) return false
  return viewer.friends.some((id) => id.toString() === ownerId.toString())
}

/**
 * POST /api/wall/posts/:id/rate
 * Body: { score } — 1 to 5.
 * Upserts: rating again just updates your previous score for this post.
 */
async function ratePost(req, res) {
  try {
    const { score } = req.body
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ error: 'score must be an integer from 1 to 5.' })
    }

    const post = await WallPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Wall post not found.' })

    const allowed = await canAccessPost(req.userId, post.ownerId)
    if (!allowed) return res.status(403).json({ error: 'You can only rate cards on your friends\' walls.' })

    await WallPostRating.findOneAndUpdate(
      { wallPostId: post._id, raterId: req.userId },
      { wallPostId: post._id, raterId: req.userId, score },
      { upsert: true }
    )

    // Return the freshly recalculated aggregate for just this one post,
    // so the frontend can update the card in place without re-fetching
    // the whole wall.
    const [updatedPost] = await attachInteractionData([post], req.userId)
    res.status(200).json({
      avgRating: updatedPost.avgRating,
      ratingCount: updatedPost.ratingCount,
      myRating: score,
    })
  } catch (err) {
    console.error('Rate post error:', err)
    res.status(500).json({ error: 'Could not save your rating.' })
  }
}

/**
 * POST /api/wall/posts/:id/react
 * Toggles the pen-emoji reaction: reacts if you hadn't, un-reacts if
 * you had. No body needed — the action IS the toggle.
 */
async function toggleReaction(req, res) {
  try {
    const post = await WallPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Wall post not found.' })

    const allowed = await canAccessPost(req.userId, post.ownerId)
    if (!allowed) return res.status(403).json({ error: 'You can only react to cards on your friends\' walls.' })

    const existing = await WallPostReaction.findOne({ wallPostId: post._id, userId: req.userId })

    if (existing) {
      await WallPostReaction.findByIdAndDelete(existing._id)
    } else {
      await WallPostReaction.create({ wallPostId: post._id, userId: req.userId })
    }

    const [updatedPost] = await attachInteractionData([post], req.userId)
    res.status(200).json({
      reactionCount: updatedPost.reactionCount,
      iReacted: updatedPost.iReacted,
    })
  } catch (err) {
    console.error('Toggle reaction error:', err)
    res.status(500).json({ error: 'Could not update your reaction.' })
  }
}

module.exports = { ratePost, toggleReaction }