/**
 * models/User.js
 * ---------------
 * Mongoose schema for a hosted-mode account.
 *
 * TEMPLATE NOTE (read this when you build Character.js, Card.js, etc.):
 * - Every schema should have `timestamps: true` instead of manually
 *   adding createdAt/updatedAt fields — Mongoose fills these in for you.
 * - Never store the plain password. Only passwordHash exists here.
 * - `select: false` on passwordHash means it's excluded from query
 *   results by default (e.g. `User.find()` won't leak it) — you have
 *   to explicitly ask for it with `.select('+passwordHash')` when you
 *   actually need to compare it during login.
 */
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // normalizes so "A@B.com" and "a@b.com" are treated the same
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from query results unless explicitly requested
    },
    // Friend graph — array of other User _ids. Kept simple (no separate
    // "Friendship" collection) since friendship here is just mutual presence
    // in each other's list, added only after a FriendRequest is accepted.
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
)

module.exports = mongoose.model('User', userSchema)