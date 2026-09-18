<!--
  FriendsView.vue
  ------------------
  A separate page from the dashboard, per the requirement — reachable
  via AppNav's "Friends" link. Requires an account (this whole feature
  needs a real server-side identity to work), so guests see a prompt
  to sign up instead of the actual page content.
-->
<template>
  <div class="friends-page">
    <AppNav />

    <main class="friends">
      <router-link to="/dashboard" class="friends__back">← Back to dashboard</router-link>

      <!-- Guest gate — this feature has no meaning without an account -->
      <div v-if="!authStore.isAuthenticated" class="friends__guest-gate">
        <h1 class="friends__guest-title">Friends require an account</h1>
        <p class="friends__guest-text">
          Sending requests and trading cards only works between real accounts — sign up to get started.
        </p>
        <router-link to="/signup" class="friends__guest-btn">Sign Up</router-link>
      </div>

      <template v-else>
        <h1 class="friends__title">Friends</h1>

        <!-- Search -->
        <section class="friends__section">
          <h2 class="friends__section-title">Find People</h2>
          <input
            v-model="searchQuery"
            type="text"
            class="friends__search-input"
            placeholder="Search by username…"
            @input="handleSearchInput"
          />
          <div v-if="friendStore.searchResults.length" class="friends__list">
            <UserSearchResultRow
              v-for="user in friendStore.searchResults"
              :key="user.id"
              :user="user"
              @send-request="handleSendRequest"
            />
          </div>
          <p v-else-if="searchQuery.trim().length >= 2" class="friends__empty-text">No users found.</p>
        </section>

        <!-- Incoming requests -->
        <section v-if="friendStore.incomingRequests.length" class="friends__section">
          <h2 class="friends__section-title">
            Incoming Requests <span class="friends__count">{{ friendStore.incomingRequests.length }}</span>
          </h2>
          <div class="friends__list">
            <FriendRequestRow
              v-for="request in friendStore.incomingRequests"
              :key="request.id"
              :request="request"
              direction="incoming"
              @accept="(id) => handleRespond(id, 'accept')"
              @decline="(id) => handleRespond(id, 'decline')"
            />
          </div>
        </section>

        <!-- Outgoing requests -->
        <section v-if="friendStore.outgoingRequests.length" class="friends__section">
          <h2 class="friends__section-title">Sent Requests</h2>
          <div class="friends__list">
            <FriendRequestRow
              v-for="request in friendStore.outgoingRequests"
              :key="request.id"
              :request="request"
              direction="outgoing"
              @cancel="handleCancel"
            />
          </div>
        </section>

        <!-- Friends list -->
        <section class="friends__section">
          <h2 class="friends__section-title">
            Your Friends <span class="friends__count">{{ friendStore.friends.length }}</span>
          </h2>
          <div v-if="friendStore.friends.length" class="friends__list">
            <FriendRow v-for="friend in friendStore.friends" :key="friend.id" :friend="friend" @remove="handleRemove" />
          </div>
          <p v-else class="friends__empty-text">No friends yet — search above to find people you know.</p>
        </section>

        <p v-if="friendStore.error" class="friends__error">{{ friendStore.error }}</p>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useFriendStore } from '../stores/friends'
import AppNav from '../components/layout/AppNav.vue'
import UserSearchResultRow from '../components/friends/UserSearchResultRow.vue'
import FriendRequestRow from '../components/friends/FriendRequestRow.vue'
import FriendRow from '../components/friends/FriendRow.vue'

const authStore = useAuthStore()
const friendStore = useFriendStore()

const searchQuery = ref('')
let searchDebounceTimer = null

onMounted(() => {
  if (authStore.isAuthenticated) {
    friendStore.fetchAll()
  }
})

// Debounced search — waits 300ms after the user stops typing before
// actually calling the API, so we're not firing a request on every
// single keystroke.
function handleSearchInput() {
  clearTimeout(searchDebounceTimer)
  const query = searchQuery.value.trim()

  if (query.length < 2) {
    friendStore.clearSearch()
    return
  }

  searchDebounceTimer = setTimeout(() => {
    friendStore.searchUsers(query)
  }, 300)
}

async function handleSendRequest(toUserId) {
  await friendStore.sendRequest(toUserId)
}

async function handleRespond(requestId, action) {
  await friendStore.respondToRequest(requestId, action)
}

async function handleCancel(requestId) {
  await friendStore.cancelRequest(requestId)
}

async function handleRemove(friendId) {
  const confirmed = confirm('Remove this friend? You can always send a new request later.')
  if (!confirmed) return
  await friendStore.removeFriend(friendId)
}
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  background: #14131f; /* ink-950 */
}

.friends {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

.friends__back {
  display: inline-block;
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.friends__back:hover {
  color: #f0e9da;
}

.friends__title {
  font-family: 'Fraunces', serif;
  font-size: 1.75rem;
  color: #f0e9da;
  margin-bottom: 2rem;
}

.friends__guest-gate {
  text-align: center;
  padding: 5rem 1.5rem;
  max-width: 28rem;
  margin: 0 auto;
}

.friends__guest-title {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem;
  color: #f0e9da;
  margin-bottom: 0.75rem;
}

.friends__guest-text {
  font-size: 0.9rem;
  color: #8b87a6;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.friends__guest-btn {
  display: inline-block;
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
}

.friends__section {
  margin-bottom: 2.5rem;
}

.friends__section-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4a24c; /* quill-gold */
  margin-bottom: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.friends__count {
  background: rgba(63, 167, 150, 0.15);
  color: #3fa796;
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.7rem;
}

.friends__search-input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: 0.5rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-size: 0.9rem;
  outline: none;
  margin-bottom: 0.9rem;
}

.friends__search-input:focus {
  border-color: #3fa796;
}

.friends__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.friends__empty-text {
  font-size: 0.85rem;
  color: #8b87a6;
  font-style: italic;
}

.friends__error {
  font-size: 0.85rem;
  color: #c1432b;
  text-align: center;
}
</style>