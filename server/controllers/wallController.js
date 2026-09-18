/**
 * controllers/wallController.js
 * ---------------------------------
 * Handles posting cards to your own wall, listing/deleting your own
 * posts, AND viewing a FRIEND's wall (getFriendWall, below — gated by
 * an actual friendship check, not just requireAuth). Same reference
 * pattern as authController.js/friendController.js throughout.
 */
const User = require('../models/User')
const WallPost = require('../models/WallPost')
const { attachInteractionData } = require('../utils/wallAggregation')

/**
 * POST /api/wall/posts
 * Body: { characterLocalId, name, premise, characterType, tags,
 *         emojis, backstory, bookmarks, dialogues }
 * Upserts by (ownerId, characterLocalId) — posting the same character
 * again updates the existing post instead of creating a duplicate.
 */
async function createOrUpdatePost(req, res) {
  try {
    const { characterLocalId, name } = req.body
    if (!characterLocalId) return res.status(400).json({ error: 'characterLocalId is required.' })
    if (!name) return res.status(400).json({ error: 'name is required.' })

    const postData = {
      ownerId: req.userId,
      characterLocalId,
      name,
      premise: req.body.premise || '',
      characterType: req.body.characterType || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      emojis: Array.isArray(req.body.emojis) ? req.body.emojis : [],
      backstory: req.body.backstory || '',
      bookmarks: Array.isArray(req.body.bookmarks) ? req.body.bookmarks : [],
      dialogues: Array.isArray(req.body.dialogues) ? req.body.dialogues : [],
    }

    const post = await WallPost.findOneAndUpdate(
      { ownerId: req.userId, characterLocalId },
      postData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ post })
  } catch (err) {
    console.error('Create/update wall post error:', err)
    res.status(500).json({ error: 'Could not post this card to your wall.' })
  }
}

/**
 * GET /api/wall/posts/mine
 * Lists the current user's own wall posts, most recent first.
 */
async function listMyPosts(req, res) {
  try {
    const posts = await WallPost.find({ ownerId: req.userId }).sort({ createdAt: -1 })
    // Even on your own wall, this attaches avgRating/reactionCount so
    // you can see how friends have responded — myRating/iReacted will
    // just always be null/false here, since rating your own card isn't
    // offered in the UI (see WallPostCard.vue's `interactive` prop).
    const postsWithData = await attachInteractionData(posts, req.userId)
    res.status(200).json({ posts: postsWithData })
  } catch (err) {
    console.error('List my wall posts error:', err)
    res.status(500).json({ error: 'Could not load your wall.' })
  }
}

/**
 * DELETE /api/wall/posts/:id
 * Ownership is enforced directly in the query (ownerId must match) —
 * if the post exists but belongs to someone else, this simply matches
 * nothing and reports "not found" rather than leaking whether the id
 * exists at all.
 */
async function deletePost(req, res) {
  try {
    const deleted = await WallPost.findOneAndDelete({ _id: req.params.id, ownerId: req.userId })
    if (!deleted) return res.status(404).json({ error: 'Wall post not found.' })

    res.status(200).json({ message: 'Removed from your wall.' })
  } catch (err) {
    console.error('Delete wall post error:', err)
    res.status(500).json({ error: 'Could not remove this post.' })
  }
}

/**
 * GET /api/wall/friend/:friendId
 * Views ANOTHER user's wall — but only if they're actually your
 * friend. This is the one check that matters for this whole feature:
 * without it, anyone with an account could view anyone else's posted
 * cards just by guessing/enumerating user ids in the URL.
 *
 * Returns 403 (not 404) when the friendship check fails — the target
 * user's existence isn't a secret (search already reveals usernames
 * exist), only their wall content is gated.
 */
async function getFriendWall(req, res) {
  try {
    const { friendId } = req.params

    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ error: 'User not found.' })

    const isActuallyFriend = me.friends.some((id) => id.toString() === friendId)
    if (!isActuallyFriend) {
      return res.status(403).json({ error: 'You can only view the walls of your friends.' })
    }

    const friend = await User.findById(friendId)
    if (!friend) return res.status(404).json({ error: 'User not found.' })

    const posts = await WallPost.find({ ownerId: friendId }).sort({ createdAt: -1 })
    const postsWithData = await attachInteractionData(posts, req.userId)

    res.status(200).json({
      friend: { id: friend._id, username: friend.username },
      posts: postsWithData,
    })
  } catch (err) {
    console.error('Get friend wall error:', err)
    res.status(500).json({ error: 'Could not load this wall.' })
  }
}

module.exports = { createOrUpdatePost, listMyPosts, deletePost, getFriendWall }