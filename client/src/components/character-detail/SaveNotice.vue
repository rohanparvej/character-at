<!--
  SaveNotice.vue
  ----------------
  Shown briefly after any edit in CharacterDetailView (backstory saved,
  bookmark added/removed/reordered, dialogue added/removed). Exists
  specifically to make the local-only storage model visible in the
  moment it matters, not just once on a banner the user dismisses and
  forgets — per the explicit requirement that every change makes clear
  it hasn't reached any server.
-->
<template>
  <Transition name="fade">
    <div v-if="visible" class="save-notice">
      <span class="save-notice__dot" />
      <span class="save-notice__text">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, required: true },
})
</script>

<style scoped>
.save-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(63, 167, 150, 0.08); /* faint signal-teal wash */
  border: 1px solid rgba(63, 167, 150, 0.25);
  border-radius: 0.5rem;
  padding: 0.6rem 0.9rem;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
  color: #b8b4cc;
}

.save-notice__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: #3fa796; /* signal-teal */
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>