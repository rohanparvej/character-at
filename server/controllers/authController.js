/**
 * controllers/authController.js
 * --------------------------------
 * This is the REFERENCE PATTERN for every controller you'll write next
 * (characterController.js, cardController.js, etc.). Pay attention to
 * the shape, not just the auth-specific logic:
 *
 * 1. Every handler is `async` and wrapped in try/catch.
 * 2. Validate input FIRST, before touching the database.
 * 3. Never trust the frontend already validated — always re-check here.
 * 4. Errors return a consistent shape: { error: "message" }
 * 5. Success returns a consistent shape: { data } or { user }, never
 *    raw Mongoose documents (they carry internal fields you don't want
 *    leaking to the client).
 */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validateEmail, validateUsername, validatePassword } = require('../utils/validators')

// Small helper kept local to this file since only auth needs to issue
// tokens right now. If other controllers need JWTs later, move this to
// utils/generateToken.js — don't duplicate the signing logic elsewhere.
function generateToken(userId) {
  return jwt.sign(
    { userId }, // payload — keep this minimal, don't stuff extra data in
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Shared response shape — used by signup, login, AND getCurrentUser so
// the frontend always gets the same fields regardless of which endpoint
// populated the auth store. Added `createdAt` here for AccountModal's
// "Member since" display — previously only getCurrentUser had it missing
// entirely; now all three are consistent.
function formatUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  }
}
// Sets the JWT as an httpOnly cookie. httpOnly means JS in the browser
// can't read it (protects against XSS stealing the token). Called by
// both signup and login so the cookie config never drifts out of sync.
function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'

  // FIX: sameSite must be 'none' in production. Locally, frontend and
  // backend both run on "localhost" (just different ports) — browsers
  // treat that as same-site, so 'lax' works fine there. In production,
  // Cloudflare Pages (*.pages.dev) and Render (*.onrender.com) are
  // genuinely DIFFERENT sites — 'lax' cookies are never sent on
  // cross-site fetch() requests (only on direct link navigation),
  // which is why /auth/me was returning 401 and refresh signed you out.
  // 'none' requires secure: true, which is already true in production.
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT expiry above
  })
}

/**
 * POST /api/auth/signup
 */
async function signup(req, res) {
  try {
    const { username, email, password } = req.body

    // --- Validation (fail fast, before any DB call) ---
    const usernameError = validateUsername(username)
    if (usernameError) return res.status(400).json({ error: usernameError })

    const emailError = validateEmail(email)
    if (emailError) return res.status(400).json({ error: emailError })

    const passwordError = validatePassword(password)
    if (passwordError) return res.status(400).json({ error: passwordError })

    // --- Uniqueness check ---
    // One query checking both fields at once, cheaper than two separate queries.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email is already taken.' })
    }

    // --- Hash password, never store plain text ---
    // 10 salt rounds is a reasonable default: strong enough, not so slow
    // it noticeably delays signup on free-tier server resources.
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({ username, email, passwordHash })

    const token = generateToken(user._id)
    setAuthCookie(res, token)

    // Only return safe fields — never the passwordHash, even though
    // `select: false` already protects most queries, be explicit here too.
    res.status(201).json({ user: formatUserResponse(user) })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { emailOrUsername, password } = req.body

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' })
    }

    // .select('+passwordHash') needed because the schema excludes it by default.
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select('+passwordHash')

    // Deliberately vague error message — don't reveal whether the
    // username/email exists or the password was wrong. Prevents
    // attackers from using this endpoint to enumerate valid accounts.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const token = generateToken(user._id)
    setAuthCookie(res, token)

    res.status(200).json({ user: formatUserResponse(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

/**
 * POST /api/auth/logout
 * Clears the cookie. Simple enough it doesn't need its own controller
 * file — kept here since it's tightly related to signup/login.
 */
function logout(req, res) {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out.' })
}

/**
 * GET /api/auth/me
 * Returns the currently logged-in user, based on the JWT cookie.
 * Relies on the `requireAuth` middleware (middleware/auth.js) running
 * first and attaching `req.userId`.
 */
async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    res.status(200).json({ user: formatUserResponse(user) })
  } catch (err) {
    console.error('Get current user error:', err)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

/**
 * PUT /api/auth/me
 * Updates username and/or email for the logged-in user. Deliberately
 * does NOT handle password changes — that needs extra safeguards
 * (confirm current password, re-issue token, etc.) and wasn't asked
 * for yet, so it's left out entirely rather than half-built.
 */
async function updateProfile(req, res) {
  try {
    const { username, email } = req.body

    // Same validation functions as signup — a username/email must be
    // just as valid whether it's set at signup or changed later.
    const usernameError = validateUsername(username)
    if (usernameError) return res.status(400).json({ error: usernameError })

    const emailError = validateEmail(email)
    if (emailError) return res.status(400).json({ error: emailError })

    // Uniqueness check, but EXCLUDING the current user — otherwise a
    // user saving their own unchanged username/email would incorrectly
    // get "already taken" (it's taken by themselves).
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.userId },
    })
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email is already taken.' })
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email },
      { new: true } // return the UPDATED document, not the pre-update one
    )

    if (!user) return res.status(404).json({ error: 'User not found.' })

    res.status(200).json({ user: formatUserResponse(user) })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Could not update your profile. Please try again.' })
  }
}

module.exports = { signup, login, logout, getCurrentUser, updateProfile }