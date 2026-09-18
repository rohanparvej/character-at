/**
 * config/db.js
 * --------------
 * Single place that owns the Mongo connection. server.js calls this
 * once on startup — no other file should call mongoose.connect directly.
 */
const mongoose = require('mongoose')

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected.')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1) // no point running the server without a DB
  }
}

module.exports = connectDB