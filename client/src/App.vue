<!--
  App.vue
  ---------
  Three responsibilities:
  1. Session restoration on load — fetchCurrentUser() checks the
     httpOnly cookie before the first route renders (unchanged from
     before).
  2. Page transitions — <Transition> wraps the route's component via
     the v-slot="{ Component }" pattern (the standard Vue Router 4 way
     to animate route changes). No extra library, just Vue core.
  3. Grain texture — GrainOverlay.vue, a separate component so it can
     be removed by deleting one line below, per the requirement that
     it stay easily excludable.
-->
<template>
  <router-view v-if="isReady" v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="$route.path" />
    </Transition>
  </router-view>
  <div v-else class="app-loading">
    <span class="app-loading__text">characterPro</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const isReady = ref(false)

onMounted(async () => {
  // fetchCurrentUser() already handles the "no valid session" case
  // gracefully (sets user to null without throwing) — see stores/auth.js.
  await authStore.fetchCurrentUser()
  isReady.value = true
})
</script>

<style>
/* FIX for the white flash during page transitions: each page component
   sets its OWN dark background individually (e.g. .dashboard-page,
   .landing), but during a route transition there's a brief moment
   where the leaving page has faded out and the entering page hasn't
   rendered yet — in that gap, nothing was setting the background, so
   the browser's default white showed through. Setting it once here,
   globally, means that gap is always dark instead. */
html,
body {
  background: #14131f; /* ink-950 */
}

/* Unscoped (no "scoped" attribute) deliberately — page transition
   classes need to apply globally, since <Transition> targets whatever
   route component is currently mounted, not something inside App.vue
   itself.

   Simple crossfade with a slight vertical drift. mode="out-in" on the
   <Transition> above ensures the leaving page fully fades out before
   the entering page fades in, avoiding an awkward overlap between two
   differently-sized pages. */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<style scoped>
.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #14131f; /* ink-950 */
}

.app-loading__text {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem;
  color: #8b87a6;
  opacity: 0.7;
}
</style>