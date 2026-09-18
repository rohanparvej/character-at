<!--
  FriendRequestRow.vue
  -----------------------
  Handles BOTH incoming and outgoing requests via the `direction` prop,
  rather than being two near-identical components — the row layout is
  identical either way, only the buttons/labels differ.
-->
<template>
  <div class="request-row">
    <div class="request-row__avatar" :style="{ background: avatarColor }">{{ initials }}</div>
    <span class="request-row__username">{{ displayUser.username }}</span>

    <template v-if="direction === 'incoming'">
      <button class="request-row__btn request-row__btn--accept" @click="$emit('accept', request.id)">
        Accept
      </button>
      <button class="request-row__btn request-row__btn--decline" @click="$emit('decline', request.id)">
        Decline
      </button>
    </template>

    <template v-else>
      <span class="request-row__status">Waiting…</span>
      <button class="request-row__btn" @click="$emit('cancel', request.id)">Cancel</button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAvatarColor, getInitials } from '../../utils/avatar'

const props = defineProps({
  request: { type: Object, required: true }, // { id, fromUser | toUser, createdAt }
  direction: { type: String, required: true }, // 'incoming' | 'outgoing'
})
defineEmits(['accept', 'decline', 'cancel'])

// Incoming requests carry `fromUser` (who sent it); outgoing carry
// `toUser` (who it was sent to) — this picks whichever applies so the
// template doesn't need its own v-if for that.
const displayUser = computed(() => (props.direction === 'incoming' ? props.request.fromUser : props.request.toUser))

const avatarColor = computed(() => getAvatarColor(displayUser.value.id))
const initials = computed(() => getInitials(displayUser.value.username))
</script>

<style scoped>
.request-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #14131f;
}

.request-row__avatar {
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

.request-row__username {
  flex: 1;
  font-size: 0.9rem;
  color: #f0e9da;
}

.request-row__btn {
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.78rem;
  cursor: pointer;
}

.request-row__btn--accept {
  background: #3fa796;
  border-color: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.request-row__btn--decline:hover {
  border-color: #c1432b;
  color: #c1432b;
}

.request-row__status {
  font-size: 0.75rem;
  color: #8b87a6;
  font-style: italic;
}
</style>