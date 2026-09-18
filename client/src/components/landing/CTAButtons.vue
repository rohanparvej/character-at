<!--
  CTAButtons.vue
  ---------------
  The three entry points into the app. Kept as its own component
  (rather than inline in HeroSection) because:
  1. It's a decision point, not decoration — easy to test/reuse independently
  2. It'll eventually need real logic (checking IndexedDB, calling the
     auth store) — isolating it now means that logic won't be tangled
     into hero layout code later.

  IMPORTANT (for when we build the auth flow next):
  - "Continue as guest" should route straight to the dashboard, no auth check.
  - "Log in" / "Sign up" route to their respective forms.
  BUG FIX NOTE: this now reads authStore, since a logged-in user
  landing on "/" was previously still shown Sign Up / Log In as if
  they weren't authenticated at all.
-->
<template>
  <div class="cta-group">
    <!-- Logged-in state: only one sensible action -->
    <template v-if="authStore.isAuthenticated">
      <router-link to="/dashboard" class="cta cta--primary">
        Go to Dashboard
      </router-link>
    </template>

    <!-- Logged-out state: original three options -->
    <template v-else>
      <router-link to="/dashboard" class="cta cta--primary">
        Continue as Guest
      </router-link>
      <router-link to="/signup" class="cta cta--secondary">
        Sign Up
      </router-link>
      <router-link to="/login" class="cta cta--ghost">
        Log In
      </router-link>
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
.cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.cta {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-block;
}

.cta:hover {
  transform: translateY(-2px);
}

.cta--primary {
  background: #3fa796; /* signal-teal */
  color: #14131f;
  box-shadow: 0 8px 20px -6px rgba(63, 167, 150, 0.5);
}

.cta--secondary {
  background: transparent;
  color: #d4a24c; /* quill-gold */
  border: 1px solid rgba(212, 162, 76, 0.5);
}

.cta--ghost {
  background: transparent;
  color: #b8b4cc;
}

.cta--ghost:hover {
  color: #f0e9da;
}
</style>