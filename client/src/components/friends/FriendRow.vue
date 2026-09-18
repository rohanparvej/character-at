<!--
  FriendRow.vue
  ---------------
  One entry in the actual friends list. Simplest of the three row
  components — just a remove action.
-->
<template>
  <div class="friend-row">
    <div class="friend-row__avatar" :style="{ background: avatarColor }">{{ initials }}</div>
    <span class="friend-row__username">{{ friend.username }}</span>
    <router-link :to="`/wall/${friend.id}`" class="friend-row__view-link">View Wall</router-link>
    <button class="friend-row__btn" @click="$emit('remove', friend.id)">Remove</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAvatarColor, getInitials } from '../../utils/avatar'

const props = defineProps({
  friend: { type: Object, required: true }, // { id, username }
})
defineEmits(['remove'])

const avatarColor = computed(() => getAvatarColor(props.friend.id))
const initials = computed(() => getInitials(props.friend.username))
</script>

<style scoped>
.friend-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #14131f;
}

.friend-row__avatar {
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

.friend-row__username {
  flex: 1;
  font-size: 0.9rem;
  color: #f0e9da;
}

.friend-row__view-link {
  font-size: 0.78rem;
  color: #3fa796;
  text-decoration: none;
  white-space: nowrap;
}

.friend-row__view-link:hover {
  text-decoration: underline;
}

.friend-row__btn {
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #8b87a6;
  font-size: 0.78rem;
  cursor: pointer;
}

.friend-row__btn:hover {
  border-color: #c1432b;
  color: #c1432b;
}
</style>