<!--
  LandingHeader.vue
  --------------------
  The landing page ("/") never renders AppNav — it's a marketing page,
  not an app screen, and CTAButtons in HeroSection already owns the
  big Log In / Sign Up / Continue as Guest decision. That's WHY there
  was no logo here even though AppNav shows one on every app screen:
  there was no header at all on this page.

  This is intentionally NOT AppNav reused: no "Browsing as guest"
  label, no Friends/Wall links — those only make sense once you're
  actually in the app. Just the brand mark, plus a single small link
  so a returning user (or someone who scrolled past the hero) has an
  obvious way back in without hunting for the CTA buttons again.

  Reads the exact same config/branding.js as AppNav, so dropping in a
  real logo file (see that file's comment) updates both places at once.
-->
<template>
  <header class="landing-header">
    <router-link to="/" class="landing-header__logo">
      <img v-if="LOGO_URL" :src="LOGO_URL" :alt="APP_NAME" class="landing-header__logo-img" />
      <span v-else class="landing-header__logo-text">{{ APP_NAME }}</span>
    </router-link>

    <router-link
      :to="authStore.isAuthenticated ? '/dashboard' : '/login'"
      class="landing-header__link"
    >
      {{ authStore.isAuthenticated ? 'Go to Dashboard' : 'Log In' }}
    </router-link>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { LOGO_URL, APP_NAME } from '../../config/branding'

const authStore = useAuthStore()
</script>

<style scoped>
.landing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 0;
  max-width: 72rem;
  margin: 0 auto;
}

.landing-header__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.landing-header__logo-img {
  height: 2.25rem;
  width: auto;
}

.landing-header__logo-text {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #f0e9da; /* parchment */
}

.landing-header__link {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #b8b4cc;
  text-decoration: none;
  padding: 0.4rem 0.5rem;
}

.landing-header__link:hover {
  color: #3fa796; /* signal-teal */
}
</style>