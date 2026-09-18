/**
 * utils/wallAggregation.js
 * ----------------------------
 * Attaches rating/reaction summary data to a list of WallPost objects:
 * avgRating, ratingCount, myRating (the VIEWER's own rating, if any),
 * reactionCount, and iReacted (whether the viewer has reacted).
 *
 * Shared by controllers/wallController.js (listMyPosts, getFriendWall —
 * every place posts get listed) and wallInteractionController.js
 * (which needs the updated numbers for just-rated/reacted post to send
 * back in its response). One implementation, not duplicated per caller.
 */
const WallPostRating = require('../models/WallPostRating')
const WallPostReaction = require('../models/WallPostReaction')

async function attachInteractionData(posts, viewerId) {
  if (posts.length === 0) return posts

  const postIds = posts.map((p) => p._id)

  // Two queries total, regardless of how many posts — NOT one query
  // per post, which would get slow fast on a wall with many cards.
  const [allRatings, allReactions] = await Promise.all([
    WallPostRating.find({ wallPostId: { $in: postIds } }),
    WallPostReaction.find({ wallPostId: { $in: postIds } }),
  ])

  return posts.map((post) => {
    const postIdStr = post._id.toString()

    const ratingsForPost = allRatings.filter((r) => r.wallPostId.toString() === postIdStr)
    const avgRating = ratingsForPost.length
      ? ratingsForPost.reduce((sum, r) => sum + r.score, 0) / ratingsForPost.length
      : null
    const myRating = ratingsForPost.find((r) => r.raterId.toString() === viewerId)?.score || null

    const reactionsForPost = allReactions.filter((r) => r.wallPostId.toString() === postIdStr)
    const iReacted = reactionsForPost.some((r) => r.userId.toString() === viewerId)

    // Spreading the Mongoose document via .toObject() (or plain object
    // if already lean) so these extra fields attach cleanly without
    // fighting Mongoose's document wrapper.
    return {
      ...(post.toObject ? post.toObject() : post),
      avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null, // one decimal place
      ratingCount: ratingsForPost.length,
      myRating,
      reactionCount: reactionsForPost.length,
      iReacted,
    }
  })
}

module.exports = { attachInteractionData }