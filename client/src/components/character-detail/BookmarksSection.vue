<!--
  BookmarksSection.vue
  -----------------------
  Chapter/scene bookmarks — "exactly where they're supposed to appear"
  per the original spec. Rendered as a vertical timeline since that
  visually matches "a sequence of points in a story."
-->
<template>
  <div class="bookmarks">
    <!-- Add form -->
    <form class="bookmarks__form" @submit.prevent="handleAdd">
      <input
        v-model="label"
        type="text"
        class="bookmarks__input"
        placeholder="Chapter 4, Scene 12, Page 8…"
      />
      <input
        v-model="note"
        type="text"
        class="bookmarks__input"
        placeholder="Optional note — what happens here"
      />
      <button type="submit" class="bookmarks__add-btn" :disabled="!label.trim()">Add</button>
    </form>

    <!-- Timeline list -->
    <div v-if="bookmarks.length" class="bookmarks__timeline">
      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id" class="bookmarks__item">
        <div class="bookmarks__dot" />
        <div class="bookmarks__item-content">
          <div class="bookmarks__item-header">
            <span class="bookmarks__item-label">{{ bookmark.label }}</span>
            <div class="bookmarks__item-controls">
              <!-- Reorder buttons — disabled at the ends rather than hidden,
                   so the row height/position doesn't jump around -->
              <button
                class="bookmarks__move"
                aria-label="Move up"
                :disabled="index === 0"
                @click="moveBookmark(index, -1)"
              >
                ↑
              </button>
              <button
                class="bookmarks__move"
                aria-label="Move down"
                :disabled="index === bookmarks.length - 1"
                @click="moveBookmark(index, 1)"
              >
                ↓
              </button>
              <button class="bookmarks__remove" aria-label="Remove" @click="$emit('delete', bookmark.id)">
                ×
              </button>
            </div>
          </div>
          <p v-if="bookmark.note" class="bookmarks__item-note">{{ bookmark.note }}</p>
        </div>
      </div>
    </div>
    <p v-else class="bookmarks__empty">No bookmarks yet — mark where this character first appears.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  bookmarks: { type: Array, default: () => [] },
})
const emit = defineEmits(['add', 'delete', 'reorder'])

const label = ref('')
const note = ref('')

function handleAdd() {
  if (!label.value.trim()) return
  emit('add', { label: label.value.trim(), note: note.value.trim() })
  label.value = ''
  note.value = ''
}

// Swaps the bookmark at `index` with its neighbor (direction: -1 up, +1 down),
// then emits the whole reordered array — parent persists it via updateCharacter.
function moveBookmark(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= props.bookmarks.length) return

  const reordered = [...props.bookmarks]
  ;[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]]
  emit('reorder', reordered)
}
</script>

<style scoped>
.bookmarks__form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
}

.bookmarks__input {
  flex: 1;
  min-width: 10rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  background: #14131f;
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-size: 0.85rem;
  outline: none;
}

.bookmarks__input:focus {
  border-color: #3fa796;
}

.bookmarks__add-btn {
  padding: 0.6rem 1.1rem;
  border-radius: 0.5rem;
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
}

.bookmarks__add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bookmarks__empty {
  color: #8b87a6;
  font-size: 0.9rem;
  font-style: italic;
}

/* Timeline: a vertical line runs down the left, each item gets a dot
   sitting on that line — classic timeline visual, done with plain CSS. */
.bookmarks__timeline {
  position: relative;
  padding-left: 1.5rem;
}

.bookmarks__timeline::before {
  content: '';
  position: absolute;
  left: 0.3rem;
  top: 0.4rem;
  bottom: 0.4rem;
  width: 1px;
  background: rgba(212, 162, 76, 0.3); /* faint quill-gold line */
}

.bookmarks__item {
  position: relative;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.bookmarks__dot {
  position: absolute;
  left: -1.5rem;
  top: 0.35rem;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  background: #d4a24c; /* quill-gold */
}

.bookmarks__item-content {
  flex: 1;
}

.bookmarks__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bookmarks__item-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: #f0e9da;
}

.bookmarks__item-note {
  font-size: 0.85rem;
  color: #8b87a6;
  margin-top: 0.25rem;
}

.bookmarks__item-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.bookmarks__move {
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 0.85rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.15rem 0.3rem;
}

.bookmarks__move:hover:not(:disabled) {
  color: #d4a24c; /* quill-gold */
}

.bookmarks__move:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.bookmarks__remove {
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}

.bookmarks__remove:hover {
  color: #c1432b;
}
</style>