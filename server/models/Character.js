/**
 * models/Character.js
 * ----------------------
 * Mirrors the shape of a character object as it exists in the
 * frontend's IndexedDB (utils/indexedDB.js) — same field names, so
 * the sync/export payloads don't need any translation layer.
 *
 * NOTE ON SCOPE: this model is being introduced now specifically so
 * the export endpoints (controllers/characterExportController.js)
 * have something to query. The CREATE/UPDATE/DELETE logic that
 * actually populates this collection (the "sync" endpoint) is still
 * your piece to write in characterController.js, following
 * authController.js's pattern. This file is shared ground between
 * both — you don't need to redefine the schema when you get there.
 */
const mongoose = require('mongoose')

// Bookmarks and dialogues are stored as subdocuments (nested schemas)
// rather than separate collections — they only ever make sense in the
// context of their parent character, never queried independently.
const bookmarkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    note: { type: String, default: '' },
  },
  { _id: true } // Mongo gives each subdocument its own _id automatically — useful for future edit/delete-by-id
)

const dialogueSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    note: { type: String, default: '' },
  },
  { _id: true }
)

const characterSchema = new mongoose.Schema(
  {
    // Every character belongs to exactly one user — this is what makes
    // ownership checks in the controller possible (see characterExportController.js).
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // characters are almost always queried by ownerId, index it
    },
    name: { type: String, required: true, trim: true },
    premise: { type: String, default: '' },
    characterType: { type: String, default: '' },
    tags: [{ type: String }],
    emojis: [{ type: String }],
    backstory: { type: String, default: '' },
    bookmarks: [bookmarkSchema],
    dialogues: [dialogueSchema],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Character', characterSchema)