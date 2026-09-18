/**
 * config/branding.js
 * ---------------------
 * Single source of truth for the app's logo. Right now LOGO_URL is
 * empty, so AppNav falls back to showing the text "characterAt".
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
export const LOGO_URL = '' // e.g. '/logo.svg' or an imported asset — empty means "use text fallback"
export const APP_NAME = 'characterAt'