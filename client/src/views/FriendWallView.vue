<!--
  FriendWallView.vue
  ---------------------
  Read-only view of a FRIEND's wall — reuses WallPostCard.vue with
  show-remove="false" (the exact reuse case that prop was designed
  for). The route itself is only reachable in the sense that the URL
  can be typed — actual access is gated server-side (getFriendWall in
  wallController.js), so if you're not really friends with this
  person, the backend returns 403 and this page shows that error
  instead of any post content.
-->
<template>
  <div class="friend-wall-page">
    <AppNav />

    <main class="friend-wall">
      <router-link to="/friends" class="friend-wall__back">← Back to friends</router-link>

      <div v-if="!authStore.isAuthenticated" class="friend-wall__guest-gate">
        <h1 class="friend-wall__guest-title">Sign in to view this wall</h1>
        <router-link to="/login" class="friend-wall__guest-btn">Log In</router-link>
      </div>

      <template v-else>
        <p v-if="wallStore.isLoading" class="friend-wall__status">Loading…</p>

        <!-- Covers both "not your friend" (403) and any other failure —
             see fetchFriendWall's comment in stores/wall.js -->
        <p v-else-if="wallStore.error" class="friend-wall__status friend-wall__status--error">
          {{ wallStore.error }}
        </p>

        <template v-else>
          <h1 class="friend-wall__title">{{ wallStore.friendWall.friend?.username }}'s Wall</h1>

          <p v-if="wallStore.friendWall.posts.length === 0" class="friend-wall__empty">
            {{ wallStore.friendWall.friend?.username }} hasn't posted any cards yet.
          </p>
          <div v-else class="friend-wall__grid">
            <WallPostCard
              v-for="post in wallStore.friendWall.posts"
              :key="post._id"
              :post="post"
              :show-remove="false"
              :interactive="true"
              @rate="handleRate"
              @react="handleReact"
            />
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useWallStore } from '../stores/wall'
import AppNav from '../components/layout/AppNav.vue'
import WallPostCard from '../components/wall/WallPostCard.vue'

const route = useRoute()
const authStore = useAuthStore()
const wallStore = useWallStore()

async function handleRate(postId, score) {
  await wallStore.ratePost(postId, score)
}

async function handleReact(postId) {
  await wallStore.reactToPost(postId)
}

function loadWall() {
  if (authStore.isAuthenticated) {
    wallStore.fetchFriendWall(route.params.friendId)
  }
}

onMounted(loadWall)

// Handles navigating directly from one friend's wall to another
// (e.g. via browser back/forward, or a future "mutual friends" link)
// without a full page reload — the route changes but this component
// instance is reused, so onMounted alone wouldn't fire again.
watch(() => route.params.friendId, loadWall)
</script>

<style scoped>
.friend-wall-page {
  min-height: 100vh;
  background: #14131f;
}

.friend-wall {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

.friend-wall__back {
  display: inline-block;
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.friend-wall__back:hover {
  color: #f0e9da;
}

.friend-wall__title {
  font-family: 'Fraunces', serif;
  font-size: 1.75rem;
  color: #f0e9da;
  margin-bottom: 2rem;
}

.friend-wall__guest-gate {
  text-align: center;
  padding: 5rem 1.5rem;
}

.friend-wall__guest-title {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  color: #f0e9da;
  margin-bottom: 1.25rem;
}

.friend-wall__guest-btn {
  display: inline-block;
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
}

.friend-wall__status {
  text-align: center;
  padding: 3rem 0;
  color: #8b87a6;
}

.friend-wall__status--error {
  color: #c1432b;
}

.friend-wall__empty {
  color: #8b87a6;
  font-size: 0.9rem;
}

.friend-wall__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .friend-wall__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>