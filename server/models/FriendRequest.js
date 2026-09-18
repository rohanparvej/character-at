/**
 * models/FriendRequest.js
 * --------------------------
 * A single pending (or resolved) friend request between two users.
 *
 * DESIGN NOTE: once a request is accepted or declined, the controller
 * deletes this document rather than keeping it around with a resolved
 * status — the actual friendship then lives in User.friends (see
 * models/User.js). This keeps the live collection meaning exactly one
 * thing: "requests currently awaiting a response." The `status` field
 * still exists (rather than assuming everything here is pending) so
 * this schema doesn't need to change if you later decide to keep a
 * history of declined/accepted requests instead of deleting them.
 */
const mongoose = require('mongoose')

const friendRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('FriendRequest', friendRequestSchema)