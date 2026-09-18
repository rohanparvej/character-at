/**
 * utils/avatar.js
 * -----------------
 * Two small pure functions used by CharacterTile's avatar circle.
 * "Random colored" per the design ask actually means DETERMINISTIC —
 * the same character should always get the same color (otherwise the
 * avatar color would flicker differently on every re-render, which
 * looks buggy rather than intentional). We fake "random" by hashing
 * the character's id into a pick from a curated palette, so it looks
 * varied across characters but is stable for any one character.
 */

// Curated palette — deliberately chosen from colors that already exist
// in the app's design tokens plus a few complementary jewel tones, so
// avatars never clash with the rest of the dark UI.
const AVATAR_COLORS = [
  '#3FA796', // signal-teal
  '#D4A24C', // quill-gold
  '#C1432B', // vermillion
  '#6B8E9F', // slate blue
  '#8E6BA8', // muted violet
  '#A87F5C', // warm brown
]

/**
 * Simple string hash (djb2 algorithm) — good enough for picking a
 * palette index, not meant to be cryptographically anything.
 */
function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

export function getAvatarColor(seed) {
  const index = hashString(seed) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

/**
 * Extracts up to 2 initials from a name — first letter of the first
 * two words ("Marlowe Finch" → "MF"), or the first two letters if
 * it's a single word ("Zephyra" → "ZE").
 */
export function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}