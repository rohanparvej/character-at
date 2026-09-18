/**
 * models/WallPost.js
 * --------------------
 * A "card posted to your wall." Deliberately a SNAPSHOT, not a
 * reference to a Character document — it stores its own copy of the
 * shareable fields at the moment you post, rather than pointing at a
 * Character record that may not even exist in MongoDB yet (since
 * "Save to Cloud" / Character sync is a separate, not-yet-built
 * feature). This means editing your local character later does NOT
 * update an existing wall post — you'd need to post again.
 *
 * characterLocalId is the character's IndexedDB id (see
 * utils/indexedDB.js on the frontend) — not a Mongo ObjectId. It's
 * used purely to recognize "post this SAME character again" as an
 * update rather than a duplicate (see the upsert in
 * controllers/wallController.js).
 */
const mongoose = require('mongoose')

// Same subdocument shape as models/Character.js's bookmarks/dialogues —
// kept consistent so a future "sync" feature could reuse this shape.
const bookmarkSchema = new mongoose.Schema({ label: String, note: String }, { _id: false })
const dialogueSchema = new mongoose.Schema({ text: String, note: String }, { _id: false })

const wallPostSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    characterLocalId: {
      type: String,
      required: true,
    },

    // Always-visible basics — same set CardVisibilityModal.vue labels
    // "always included on the card."
    name: { type: String, required: true },
    premise: { type: String, default: '' },
    characterType: { type: String, default: '' },
    tags: [{ type: String }],
    emojis: [{ type: String }],

    // Optional sections — only populated if the character's
    // cardVisibility flags were on at the moment of posting. Empty
    // string/array here means "not shared," not "shared but empty."
    backstory: { type: String, default: '' },
    bookmarks: [bookmarkSchema],
    dialogues: [dialogueSchema],
  },
  {
    timestamps: true,
  }
)

// One post per (owner, character) pair — posting the same character
// again updates it via upsert (see wallController.js) rather than
// creating a duplicate. This index enforces that at the DB level too,
// as a safety net beyond the controller's own upsert logic.
wallPostSchema.index({ ownerId: 1, characterLocalId: 1 }, { unique: true })

module.exports = mongoose.model('WallPost', wallPostSchema)