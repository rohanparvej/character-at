/**
 * utils/validators.js
 * ---------------------
 * Plain validation functions — no library dependency (keeps things
 * FOSS-simple and dependency-light). Each function returns either
 * `null` (valid) or a short error string (invalid), so controllers
 * can do:
 *
 *   const error = validateEmail(email)
 *   if (error) return res.status(400).json({ error })
 *
 * TEMPLATE NOTE: when you validate Character/Card fields later,
 * follow this same "return null or an error string" pattern so every
 * controller in the app handles validation errors identically.
 */

function validateEmail(email) {
  if (!email) return 'Email is required.'
  // Simple, deliberately not over-engineered regex — good enough to
  // catch obvious typos, real verification happens via confirmation
  // email later if you add that feature.
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmailPattern.test(email)) return 'Enter a valid email address.'
  return null
}

function validateUsername(username) {
  if (!username) return 'Username is required.'
  if (username.length < 3) return 'Username must be at least 3 characters.'
  if (username.length > 24) return 'Username must be under 24 characters.'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores.'
  }
  return null
}

function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

module.exports = { validateEmail, validateUsername, validatePassword }