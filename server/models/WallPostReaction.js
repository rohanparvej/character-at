/**
 * models/WallPostReaction.js
 * -------------------------------
 * The "pen emoji" reaction (this app's substitute for a like). A
 * reaction's existence IS the signal — there's no separate boolean or
 * type field, since there's only one reaction kind right now.
 * Toggling off means deleting the document (see toggleReaction in
 * wallInteractionController.js), not flipping a flag.
 */
const mongoose = require('mongoose')

const wallPostReactionSchema = new mongoose.Schema(
  {
    wallPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WallPost',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

wallPostReactionSchema.index({ wallPostId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('WallPostReaction', wallPostReactionSchema)