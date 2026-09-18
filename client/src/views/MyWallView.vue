<!--
  MyWallView.vue
  ----------------
  Shows YOUR OWN posted cards only — viewing friends' walls is a
  separate future step (not built here). Requires an account, same
  guest-gate pattern as FriendsView.vue.
-->
<template>
  <div class="wall-page">
    <AppNav />

    <main class="wall">
      <router-link to="/dashboard" class="wall__back">← Back to dashboard</router-link>

      <div v-if="!authStore.isAuthenticated" class="wall__guest-gate">
        <h1 class="wall__guest-title">Your wall requires an account</h1>
        <p class="wall__guest-text">
          Posting cards for friends to see only makes sense with a real account — sign up to get started.
        </p>
        <router-link to="/signup" class="wall__guest-btn">Sign Up</router-link>
      </div>

      <template v-else>
        <h1 class="wall__title">Your Wall</h1>
        <p class="wall__subtitle">
          Cards you've posted here are visible to friends once that feature ships — for now, this is a preview of what you've shared.
        </p>

        <p v-if="wallStore.isLoading" class="wall__status">Loading…</p>
        <p v-else-if="wallStore.myPosts.length === 0" class="wall__empty">
          Nothing posted yet. Open a character and use "Post to Wall" to add one here.
        </p>
        <div v-else class="wall__grid">
          <WallPostCard
            v-for="post in wallStore.myPosts"
            :key="post._id"
            :post="post"
            :show-remove="true"
            @remove="handleRemove"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWallStore } from '../stores/wall'
import AppNav from '../components/layout/AppNav.vue'
import WallPostCard from '../components/wall/WallPostCard.vue'

const authStore = useAuthStore()
const wallStore = useWallStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    wallStore.fetchMyPosts()
  }
})

async function handleRemove(postId) {
  const confirmed = confirm('Remove this card from your wall?')
  if (!confirmed) return
  await wallStore.deletePost(postId)
}
</script>

<style scoped>
.wall-page {
  min-height: 100vh;
  background: #14131f;
}

.wall {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

.wall__back {
  display: inline-block;
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.wall__back:hover {
  color: #f0e9da;
}

.wall__title {
  font-family: 'Fraunces', serif;
  font-size: 1.75rem;
  color: #f0e9da;
  margin-bottom: 0.5rem;
}

.wall__subtitle {
  font-size: 0.85rem;
  color: #8b87a6;
  margin-bottom: 2rem;
  max-width: 34rem;
  line-height: 1.6;
}

.wall__guest-gate {
  text-align: center;
  padding: 5rem 1.5rem;
  max-width: 28rem;
  margin: 0 auto;
}

.wall__guest-title {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem;
  color: #f0e9da;
  margin-bottom: 0.75rem;
}

.wall__guest-text {
  font-size: 0.9rem;
  color: #8b87a6;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.wall__guest-btn {
  display: inline-block;
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
}

.wall__status,
.wall__empty {
  color: #8b87a6;
  font-size: 0.9rem;
  text-align: center;
  padding: 3rem 0;
}

.wall__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .wall__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>