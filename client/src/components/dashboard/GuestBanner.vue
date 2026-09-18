<!--
  GuestBanner.vue
  ------------------
  Explains WHY the dashboard behaves the way it does for guests —
  data lives in this browser only. Dismissible via local component
  state (not persisted — reappears on reload, which is fine since it's
  a gentle reminder, not a one-time tutorial).

  Only rendered when logged out — DashboardView controls that via v-if,
  this component doesn't check auth state itself.
-->
<template>
  <div v-if="visible" class="guest-banner">
    <p class="guest-banner__text">
      Your characters are saved in <strong>this browser only</strong>.
      <router-link to="/signup" class="guest-banner__link">Sign up</router-link>
      to unlock friend requests, card trading, and access from other devices.
    </p>
    <button class="guest-banner__dismiss" aria-label="Dismiss" @click="visible = false">×</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(true)
</script>

<style scoped>
.guest-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(212, 162, 76, 0.08); /* faint quill-gold wash */
  border: 1px solid rgba(212, 162, 76, 0.25);
  border-radius: 0.6rem;
  padding: 0.85rem 1.1rem;
  margin-bottom: 2rem;
}

.guest-banner__text {
  font-size: 0.85rem;
  color: #d8d4e8;
  line-height: 1.5;
}

.guest-banner__link {
  color: #d4a24c; /* quill-gold */
  font-weight: 600;
}

.guest-banner__dismiss {
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
}

.guest-banner__dismiss:hover {
  color: #f0e9da;
}
</style>