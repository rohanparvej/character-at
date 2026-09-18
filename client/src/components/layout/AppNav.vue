<!--
  AppNav.vue
  ------------
  Top navigation bar. Auth-aware: reads authStore.isAuthenticated to
  decide whether to show "Log In / Sign Up" or "username + Log Out".

  UPDATES:
  - Logo now reads from config/branding.js — set LOGO_URL there once
    you have a real logo file, no changes needed here.
  - Username is now clickable, opens AccountModal (view-only account info).
-->
<template>
  <nav class="app-nav">
    <router-link to="/" class="app-nav__logo">
      <img v-if="LOGO_URL" :src="LOGO_URL" :alt="APP_NAME" class="app-nav__logo-img" />
      <span v-else>{{ APP_NAME }}</span>
    </router-link>

    <div class="app-nav__actions">
      <!-- Guest / logged-out state -->
      <template v-if="!authStore.isAuthenticated">
        <span class="app-nav__guest-label">Browsing as guest</span>
        <router-link to="/login" class="app-nav__link">Log In</router-link>
        <router-link to="/signup" class="app-nav__link app-nav__link--primary">Sign Up</router-link>
      </template>

      <!-- Logged-in state -->
      <template v-else>
        <router-link to="/friends" class="app-nav__link">Friends</router-link>
        <router-link to="/wall" class="app-nav__link">My Wall</router-link>
        <button class="app-nav__username" @click="isAccountModalOpen = true">
          {{ authStore.user.username }}
        </button>
        <button class="app-nav__link" @click="handleLogout">Log Out</button>
      </template>
    </div>

    <AccountModal v-if="isAccountModalOpen" @close="isAccountModalOpen = false" />
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { LOGO_URL, APP_NAME } from '../../config/branding'
import AccountModal from './AccountModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAccountModalOpen = ref(false)

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
}

.app-nav__logo {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem;
  color: #f0e9da; /* parchment */
  text-decoration: none;
  display: flex;
  align-items: center;
}

.app-nav__logo-img {
  height: 1.75rem; /* keeps any uploaded logo a consistent nav height regardless of its native size */
  width: auto;
}

.app-nav__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.app-nav__guest-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b87a6; /* ink-faint */
}

.app-nav__username {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  color: #3fa796; /* signal-teal */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
}

.app-nav__username:hover {
  text-decoration: underline;
}

.app-nav__link {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #b8b4cc;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
}

.app-nav__link:hover {
  color: #f0e9da;
}

.app-nav__link--primary {
  background: #3fa796;
  color: #14131f;
  border-radius: 0.4rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
}

.app-nav__link--primary:hover {
  color: #14131f;
  opacity: 0.9;
}
</style>