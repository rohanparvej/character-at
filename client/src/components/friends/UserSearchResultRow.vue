<!--
  UserSearchResultRow.vue
  --------------------------
  One row in the search results list. The button changes based on
  `relationshipStatus`, which the backend computes per-result (see
  searchUsers in friendController.js) so this component doesn't need
  to cross-reference the friends/requests lists itself.
-->
<template>
  <div class="result-row">
    <div class="result-row__avatar" :style="{ background: avatarColor }">{{ initials }}</div>
    <span class="result-row__username">{{ user.username }}</span>

    <button
      v-if="user.relationshipStatus === 'none'"
      class="result-row__btn result-row__btn--primary"
      @click="$emit('send-request', user.id)"
    >
      Send Request
    </button>
    <span v-else-if="user.relationshipStatus === 'pending_outgoing'" class="result-row__status">
      Request Sent
    </span>
    <span v-else-if="user.relationshipStatus === 'pending_incoming'" class="result-row__status">
      Sent You a Request
    </span>
    <span v-else-if="user.relationshipStatus === 'friend'" class="result-row__status result-row__status--friend">
      Already Friends
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAvatarColor, getInitials } from '../../utils/avatar'

const props = defineProps({
  user: { type: Object, required: true }, // { id, username, relationshipStatus }
})
defineEmits(['send-request'])

const avatarColor = computed(() => getAvatarColor(props.user.id))
const initials = computed(() => getInitials(props.user.username))
</script>

<style scoped>
.result-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #14131f; /* ink-950 */
}

.result-row__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: #14131f;
  flex-shrink: 0;
}

.result-row__username {
  flex: 1;
  font-size: 0.9rem;
  color: #f0e9da;
}

.result-row__btn {
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  border: none;
  font-size: 0.78rem;
  cursor: pointer;
}

.result-row__btn--primary {
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.result-row__status {
  font-size: 0.75rem;
  color: #8b87a6;
  font-style: italic;
}

.result-row__status--friend {
  color: #3fa796;
}
</style>