/**
 * models/WallPostRating.js
 * ----------------------------
 * One rating per (wallPostId, raterId) pair — the unique index below
 * enforces this at the DB level. Rating again with a new score
 * updates the existing document (upsert in wallInteractionController.js)
 * rather than creating a second rating from the same person.
 */
const mongoose = require('mongoose')

const wallPostRatingSchema = new mongoose.Schema(
  {
    wallPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WallPost',
      required: true,
      index: true,
    },
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
)

wallPostRatingSchema.index({ wallPostId: 1, raterId: 1 }, { unique: true })

module.exports = mongoose.model('WallPostRating', wallPostRatingSchema)