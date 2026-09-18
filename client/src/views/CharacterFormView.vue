<!--
  CharacterFormView.vue
  ------------------------
  One view handles BOTH create and edit — determined by whether the
  route has an :id param. This avoids duplicating near-identical form
  markup across two separate files (CreateCharacterView + EditCharacterView).
-->
<template>
  <main class="form-page">
    <div class="form-card">
      <h1 class="form-card__title">{{ isEditMode ? 'Edit Character' : 'New Character' }}</h1>

      <form @submit.prevent="handleSubmit">
        <AuthFormInput
          id="name"
          v-model="form.name"
          label="Name"
          placeholder="Marlowe Finch"
          :error="fieldErrors.name"
        />

        <div class="form-field">
          <label for="premise" class="form-field__label">Premise</label>
          <textarea
            id="premise"
            v-model="form.premise"
            class="form-field__textarea"
            rows="4"
            placeholder="A disgraced cartographer who maps places that no longer exist."
          />
        </div>

        <div class="form-field">
          <label for="characterType" class="form-field__label">Character type</label>
          <select id="characterType" v-model="form.characterType" class="form-field__select">
            <option value="">Select a type</option>
            <option v-for="type in characterTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <!-- Tags need custom handling (not a plain text input) — see
             addTag/removeTag below. Kept inline here rather than its
             own component since it's fairly small and specific to this form. -->
        <div class="form-field">
          <label for="tagInput" class="form-field__label">Tags / adjectives</label>
          <input
            id="tagInput"
            v-model="tagInput"
            type="text"
            class="form-field__input"
            placeholder="Press Enter to add a tag"
            @keydown.enter.prevent="addTag"
          />
          <div v-if="form.tags.length" class="form-field__tag-list">
            <span v-for="tag in form.tags" :key="tag" class="form-field__tag">
              {{ tag }}
              <button type="button" class="form-field__tag-remove" @click="removeTag(tag)">×</button>
            </span>
          </div>
        </div>

        <!-- Emoji picker — click to toggle, capped at 5 so the card
             doesn't get cluttered. Kept as a fixed curated set rather
             than a full emoji library/picker, no dependency needed. -->
        <div class="form-field">
          <label class="form-field__label">Emojis (up to 5)</label>
          <div class="form-field__emoji-grid">
            <button
              v-for="emoji in emojiOptions"
              :key="emoji"
              type="button"
              class="form-field__emoji-btn"
              :class="{ 'form-field__emoji-btn--selected': form.emojis.includes(emoji) }"
              @click="toggleEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <p v-if="submitError" class="form-card__error">{{ submitError }}</p>

        <div class="form-card__actions">
          <button type="submit" class="form-card__submit">
            {{ isEditMode ? 'Save Changes' : 'Create Character' }}
          </button>
          <router-link to="/dashboard" class="form-card__cancel">Cancel</router-link>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/characters'
import AuthFormInput from '../components/auth/AuthFormInput.vue'

const route = useRoute()
const router = useRouter()
const characterStore = useCharacterStore()

// If the route has an :id param, we're editing an existing character;
// otherwise this is a fresh create. Same form, same submit handler,
// branching only where it actually matters (see handleSubmit below).
const isEditMode = computed(() => !!route.params.id)

const characterTypes = ['Protagonist', 'Antagonist', 'Side Character', 'Mentor', 'Love Interest', 'Other']

// Curated set — themed around common story-character traits/roles
// rather than a generic emoji keyboard, so the picker stays small and relevant.
const emojiOptions = ['⚔️', '👑', '🔥', '🌙', '🕯️', '📖', '💔', '🗡️', '🐉', '🎭', '⭐', '🌊', '🦁', '🌹', '💀', '🛡️']

const form = reactive({
  name: '',
  premise: '',
  characterType: '',
  tags: [],
  emojis: [],
})

const tagInput = ref('')
const fieldErrors = ref({})
const submitError = ref('')

// Pre-fill the form when editing. Runs on mount rather than a watcher
// since the :id param doesn't change while this view is active.
onMounted(async () => {
  if (isEditMode.value) {
    // FIX: if this page is opened directly (refresh, bookmark, shared
    // link) without visiting the dashboard first, the store is empty.
    // Load from IndexedDB here too, not just in DashboardView.
    if (characterStore.characters.length === 0) {
      await characterStore.fetchAll()
    }
    const existing = characterStore.getById(route.params.id)
    if (!existing) {
      // Character not found in this browser's IndexedDB (e.g. bad URL,
      // or data was cleared) — bounce back rather than showing a broken form.
      router.push('/dashboard')
      return
    }
    form.name = existing.name
    form.premise = existing.premise
    form.characterType = existing.characterType || ''
    form.tags = [...existing.tags]
    form.emojis = [...(existing.emojis || [])]
  }
})

function toggleEmoji(emoji) {
  if (form.emojis.includes(emoji)) {
    form.emojis = form.emojis.filter((e) => e !== emoji)
    return
  }
  if (form.emojis.length >= 5) return // silently ignore past the cap, no need for an error state here
  form.emojis.push(emoji)
}

function addTag() {
  const value = tagInput.value.trim()
  if (!value) return
  if (form.tags.includes(value)) {
    tagInput.value = ''
    return // silently ignore duplicates rather than showing an error for something this minor
  }
  form.tags.push(value)
  tagInput.value = ''
}

function removeTag(tag) {
  form.tags = form.tags.filter((t) => t !== tag)
}

function validateForm() {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  submitError.value = ''
  if (!validateForm()) return

  try {
    if (isEditMode.value) {
      await characterStore.updateCharacter(route.params.id, { ...form })
    } else {
      await characterStore.createCharacter({ ...form })
    }
    router.push('/dashboard')
  } catch (err) {
    submitError.value = 'Could not save this character. Please try again.'
    console.error(err)
  }
}
</script>

<style scoped>
.form-page {
  min-height: 100vh;
  background: #14131f;
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: center;
}

.form-card {
  width: 100%;
  max-width: 32rem;
}

.form-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1.6rem;
  color: #f0e9da;
  margin-bottom: 1.75rem;
}

.form-field {
  margin-bottom: 1.25rem;
}

.form-field__label {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b87a6;
  margin-bottom: 0.4rem;
}

.form-field__textarea,
.form-field__select,
.form-field__input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 0.5rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
  resize: vertical;
}

.form-field__textarea:focus,
.form-field__select:focus,
.form-field__input:focus {
  border-color: #3fa796;
}

.form-field__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.form-field__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  background: rgba(63, 167, 150, 0.12);
  color: #3fa796;
}

.form-field__tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
}

.form-field__emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.form-field__emoji-btn {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.5rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.form-field__emoji-btn:hover {
  transform: translateY(-2px);
}

.form-field__emoji-btn--selected {
  border-color: #3fa796; /* signal-teal */
  background: rgba(63, 167, 150, 0.15);
}

.form-card__error {
  font-size: 0.85rem;
  color: #c1432b;
  margin-bottom: 1rem;
}

.form-card__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1.5rem;
}

.form-card__submit {
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.form-card__cancel {
  color: #8b87a6;
  font-size: 0.85rem;
  text-decoration: none;
}

.form-card__cancel:hover {
  color: #f0e9da;
}
</style>