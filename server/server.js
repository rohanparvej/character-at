/**
 * server.js
 * -----------
 * App entry point. Keeps setup minimal and readable — as you add more
 * resources (character, card, etc.), just add one more
 * `app.use('/api/x', xRoutes)` line, following the auth pattern below.
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const characterRoutes = require('./routes/character')
const userRoutes = require('./routes/users')
const friendRoutes = require('./routes/friends')
const wallRoutes = require('./routes/wall')

const app = express()

// --- Core middleware ---
app.use(express.json()) // parses JSON request bodies
app.use(cookieParser()) // lets req.cookies.token work in middleware/auth.js
app.use(
  cors({
    origin: process.env.CLIENT_URL, // your Vue dev server / deployed frontend URL
    credentials: true, // required so the browser sends/receives the httpOnly cookie
  })
)

// --- Routes ---
// TEMPLATE NOTE: this is the pattern for every future resource:
//   app.use('/api/characters', characterRoutes)
//   app.use('/api/cards', cardRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/users', userRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/wall', wallRoutes)

// Simple health check — useful once deployed on Render's free tier,
// lets you confirm the server is actually up.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})