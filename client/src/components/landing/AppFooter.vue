<!--
  AppFooter.vue
  --------------
  Was a single centered line. Expanded into three columns (brand blurb,
  quick links, version/legal) — still static/no logic, just more
  information now that there's more worth surfacing: the logo (matching
  LandingHeader/AppNav), a way back to the privacy section instead of
  only mentioning open source, and a version + year line so it doesn't
  read like an unfinished page.
-->
<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <router-link to="/" class="footer__logo">
          <img v-if="LOGO_URL" :src="LOGO_URL" :alt="APP_NAME" class="footer__logo-img" />
          <span v-else class="footer__logo-text">{{ APP_NAME }}</span>
        </router-link>
        <p class="footer__tagline">
          A free, open-source home for your characters — local-first, yours to keep.
        </p>
      </div>

      <nav class="footer__links" aria-label="Footer">
        <span class="footer__links-heading">Product</span>
        <router-link to="/#privacy" class="footer__link">How privacy works</router-link>
        <router-link to="/privacy-policy" class="footer__link">Privacy Policy</router-link>
        <a
          :href="GITHUB_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__link"
        >
          Source code
        </a>
      </nav>

      <div class="footer__meta">
        <span class="footer__links-heading">About</span>
        <p class="footer__meta-line">{{ APP_NAME }} v{{ APP_VERSION }}</p>
        <p class="footer__meta-line">Not Prepared For Release Yet &middot; free &amp; open source</p>
        <p class="footer__meta-line">&copy; {{ currentYear }} {{ APP_NAME }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Static footer, no logic beyond the current year.
import { LOGO_URL, APP_NAME, APP_VERSION, GITHUB_URL } from '../../config/branding'

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid rgba(139, 135, 166, 0.15);
  padding: 2.5rem 1.5rem 2rem;
}

.footer__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 700px) {
  .footer__inner {
    grid-template-columns: 1.4fr 1fr 1fr;
  }
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  width: fit-content;
}

.footer__logo-img {
  height: 2rem;
  width: auto;
}

.footer__logo-text {
  font-family: 'Fraunces', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #f0e9da; /* parchment */
}

.footer__tagline {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #8b87a6;
  max-width: 24rem;
}

.footer__links,
.footer__meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer__links-heading {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #3fa796; /* signal-teal */
  margin-bottom: 0.2rem;
}

.footer__link {
  font-size: 0.85rem;
  color: #b8b4cc;
  text-decoration: none;
  width: fit-content;
}

.footer__link:hover {
  color: #d4a24c; /* quill-gold */
}

.footer__meta-line {
  font-size: 0.8rem;
  color: #8b87a6;
}
</style>