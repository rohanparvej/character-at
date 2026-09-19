/**
 * config/branding.js
 * ---------------------
 * Single source of truth for the app's logo. LOGO_URL currently points
 * at /logo.svg — put an actual file at client/public/logo.svg (or
 * change the path below) or every place that reads LOGO_URL (AppNav,
 * LandingHeader, AppFooter) will render a broken image instead of
 * falling back to the "characterAt" text — the text fallback only
 * kicks in when LOGO_URL is empty/falsy, not just missing on disk.
 *
 * WHEN YOU HAVE A LOGO FILE:
 * 1. Drop the image into client/src/assets/ (e.g. assets/logo.svg)
 * 2. Import it here: import logo from '../assets/logo.svg'
 * 3. Set LOGO_URL = logo
 * That's it — AppNav (and anywhere else that imports this file) will
 * automatically switch from text to the image, no other changes needed.
 *
 * Alternatively, if the logo is hosted externally (e.g. a CDN URL),
 * just set LOGO_URL to that URL string directly instead of importing
 * a local file.
 */
export const LOGO_URL = '/logo.svg' // e.g. '/logo.svg' or an imported asset — empty means "use text fallback"
export const APP_NAME = 'characterAt'

// Shown in AppFooter.vue (landing page) as "vX.Y.Z". Bump this by hand
// alongside client/package.json's "version" field when you cut a release —
// kept as a plain constant here (rather than importing package.json)
// since Vite doesn't need a build step just to read one string.
export const APP_VERSION = ' alpha 0.1.0'

// Single place for the repo link — read by AppFooter.vue and
// OpenSourceSection.vue. Update this one line once the real repo
// exists instead of hunting down every hardcoded "https://github.com/".
export const GITHUB_URL = 'https://github.com/rohanparvej/character-at'