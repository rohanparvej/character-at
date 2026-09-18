<!--
  BackstorySection.vue
  -----------------------
  Two modes: read view (formatted paragraphs) and edit view (textarea).
  Starts in read mode so the page isn't always showing an open textarea —
  only switches to edit when the user asks to.
-->
<template>
  <div class="backstory">
    <!-- Edit mode -->
    <div v-if="isEditing">
      <textarea
        v-model="draft"
        class="backstory__textarea"
        rows="10"
        placeholder="Where did they come from? What shaped them before page one?"
      />
      <div class="backstory__actions">
        <button class="backstory__btn backstory__btn--primary" @click="handleSave">Save</button>
        <button class="backstory__btn" @click="cancelEdit">Cancel</button>
      </div>
    </div>

    <!-- Read mode -->
    <div v-else>
      <div v-if="backstory" class="backstory__content">
        <!-- Split on double line breaks so paragraphs written with blank
             lines between them render as separate <p> tags, not one blob -->
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
      </div>
      <p v-else class="backstory__empty">No backstory written yet.</p>

      <button class="backstory__btn" @click="startEdit">
        {{ backstory ? 'Edit Backstory' : 'Add Backstory' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  backstory: { type: String, default: '' },
})
const emit = defineEmits(['save'])

const isEditing = ref(false)
const draft = ref('')

const paragraphs = computed(() =>
  props.backstory.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
)

function startEdit() {
  draft.value = props.backstory
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function handleSave() {
  emit('save', draft.value)
  isEditing.value = false
}
</script>

<style scoped>
.backstory__content p {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #d8d4e8;
  margin-bottom: 1rem;
}

.backstory__empty {
  color: #8b87a6;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  font-style: italic;
}

.backstory__textarea {
  width: 100%;
  padding: 0.85rem;
  border-radius: 0.5rem;
  background: #14131f; /* ink-950 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  margin-bottom: 1rem;
}

.backstory__textarea:focus {
  border-color: #3fa796;
}

.backstory__actions {
  display: flex;
  gap: 0.75rem;
}

.backstory__btn {
  padding: 0.55rem 1.1rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.backstory__btn:hover {
  border-color: #d4a24c;
  color: #d4a24c;
}

.backstory__btn--primary {
  background: #3fa796;
  border-color: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.backstory__btn--primary:hover {
  color: #14131f;
  opacity: 0.9;
}
</style>