<!--
  DialoguesSection.vue
  -----------------------
  "A collection of their rough-dialogues" per spec. Styled as quote
  cards — a large decorative quotation mark behind the text reinforces
  what this section is for at a glance.
-->
<template>
  <div class="dialogues">
    <!-- Add form -->
    <form class="dialogues__form" @submit.prevent="handleAdd">
      <textarea
        v-model="text"
        class="dialogues__textarea"
        rows="3"
        placeholder="Write a line the way they'd actually say it…"
      />
      <input
        v-model="note"
        type="text"
        class="dialogues__input"
        placeholder="Optional context — when/why they say this"
      />
      <button type="submit" class="dialogues__add-btn" :disabled="!text.trim()">Add Dialogue</button>
    </form>

    <!-- Dialogue cards -->
    <div v-if="dialogues.length" class="dialogues__grid">
      <div v-for="dialogue in dialogues" :key="dialogue.id" class="dialogues__card">
        <span class="dialogues__quote-mark">“</span>
        <p class="dialogues__text">{{ dialogue.text }}</p>
        <p v-if="dialogue.note" class="dialogues__note">— {{ dialogue.note }}</p>
        <button class="dialogues__remove" aria-label="Remove" @click="$emit('delete', dialogue.id)">
          ×
        </button>
      </div>
    </div>
    <p v-else class="dialogues__empty">No dialogue collected yet — jot down a line that sounds like them.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  dialogues: { type: Array, default: () => [] },
})
const emit = defineEmits(['add', 'delete'])

const text = ref('')
const note = ref('')

function handleAdd() {
  if (!text.value.trim()) return
  emit('add', { text: text.value.trim(), note: note.value.trim() })
  text.value = ''
  note.value = ''
}
</script>

<style scoped>
.dialogues__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
}

.dialogues__textarea,
.dialogues__input {
  padding: 0.65rem 0.85rem;
  border-radius: 0.5rem;
  background: #14131f;
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-size: 0.85rem;
  outline: none;
  resize: vertical;
  font-family: 'Inter', sans-serif;
}

.dialogues__textarea:focus,
.dialogues__input:focus {
  border-color: #3fa796;
}

.dialogues__add-btn {
  align-self: flex-start;
  padding: 0.55rem 1.1rem;
  border-radius: 0.5rem;
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
}

.dialogues__add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dialogues__empty {
  color: #8b87a6;
  font-size: 0.9rem;
  font-style: italic;
}

.dialogues__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .dialogues__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dialogues__card {
  position: relative;
  background: #14131f; /* ink-950, darker than the panel behind it for contrast */
  border: 1px solid rgba(139, 135, 166, 0.2);
  border-radius: 0.6rem;
  padding: 1.5rem 1.25rem 1.25rem;
  overflow: hidden;
}

.dialogues__quote-mark {
  position: absolute;
  top: -0.5rem;
  left: 0.5rem;
  font-family: 'Fraunces', serif;
  font-size: 4rem;
  color: rgba(63, 167, 150, 0.12); /* very faint signal-teal, decorative only */
  line-height: 1;
  pointer-events: none;
}

.dialogues__text {
  position: relative;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 1rem;
  line-height: 1.6;
  color: #f0e9da;
  margin-bottom: 0.6rem;
}

.dialogues__note {
  font-size: 0.75rem;
  color: #8b87a6;
}

.dialogues__remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}

.dialogues__remove:hover {
  color: #c1432b;
}
</style>