<!--
  CardVisibilityModal.vue
  ---------------------------
  Lets the user choose which extra sections would be visible if this
  character's card is ever shared/traded (card trading itself isn't
  built yet — this just captures the preference now, per your request,
  so it's ready when that feature exists).

  Structurally mirrors AccountModal.vue: backdrop, Escape/click-outside
  to close, same visual language — consistency helps here since both
  are "settings panels."
-->
<template>
  <!--
    BUG FIX: Teleport moves this modal's DOM to directly under <body>,
    regardless of where it's written here. Without it, this modal (a
    child of CharacterTile's .tile element) gets trapped by .tile:hover's
    `transform` — CSS makes position:fixed relative to the nearest
    transformed ancestor, not the viewport, whenever one exists. That
    caused the modal to reposition every time hover toggled on/off,
    producing the rapid flashing.
  -->
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="Close" @click="$emit('close')">×</button>

        <h2 class="modal__title">Card Sharing Settings</h2>
        <p class="modal__subtitle">Choose what appears if you ever share {{ character.name }}'s card.</p>

        <!-- Always-visible fields, shown but not toggleable — makes clear
             these aren't part of the checklist below, avoiding confusion
             about why they can't be unchecked. -->
        <div class="modal__always-visible">
          <span class="modal__always-visible-label">Always included on the card</span>
          <p class="modal__always-visible-list">Name, avatar, type, premise, tags, emojis</p>
        </div>

        <!-- The actual checklist -->
        <div class="modal__checklist">
          <label class="modal__checkbox-row">
            <input v-model="draft.showBackstory" type="checkbox" class="modal__checkbox" />
            <span>
              <span class="modal__checkbox-title">Backstory</span>
              <span class="modal__checkbox-desc">Their history, before page one.</span>
            </span>
          </label>

          <label class="modal__checkbox-row">
            <input v-model="draft.showBookmarks" type="checkbox" class="modal__checkbox" />
            <span>
              <span class="modal__checkbox-title">Chapter Bookmarks</span>
              <span class="modal__checkbox-desc">Where they appear in your story.</span>
            </span>
          </label>

          <label class="modal__checkbox-row">
            <input v-model="draft.showDialogues" type="checkbox" class="modal__checkbox" />
            <span>
              <span class="modal__checkbox-title">Rough Dialogues</span>
              <span class="modal__checkbox-desc">Lines that sound like them.</span>
            </span>
          </label>
        </div>

        <div class="modal__actions">
          <button class="modal__btn modal__btn--primary" @click="handleSave">Save</button>
          <button class="modal__btn" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  character: { type: Object, required: true },
})
const emit = defineEmits(['close', 'save'])

// Local draft — existing characters won't have cardVisibility set yet,
// so default everything to false (privacy-conservative default,
// consistent with the app's local-first stance elsewhere).
const draft = reactive({
  showBackstory: props.character.cardVisibility?.showBackstory || false,
  showBookmarks: props.character.cardVisibility?.showBookmarks || false,
  showDialogues: props.character.cardVisibility?.showDialogues || false,
})

function handleSave() {
  emit('save', { ...draft })
}

function handleKeydown(event) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1.5rem;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 26rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(212, 162, 76, 0.25);
  border-radius: 0.75rem;
  padding: 2rem;
}

.modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.9rem;
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.modal__close:hover {
  color: #f0e9da;
}

.modal__title {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  color: #f0e9da;
  margin-bottom: 0.4rem;
}

.modal__subtitle {
  font-size: 0.85rem;
  color: #8b87a6;
  margin-bottom: 1.25rem;
}

.modal__always-visible {
  background: rgba(212, 162, 76, 0.08);
  border: 1px solid rgba(212, 162, 76, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.modal__always-visible-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #d4a24c; /* quill-gold */
  display: block;
  margin-bottom: 0.3rem;
}

.modal__always-visible-list {
  font-size: 0.8rem;
  color: #b8b4cc;
}

.modal__checklist {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
}

.modal__checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;
}

.modal__checkbox {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: #3fa796; /* signal-teal — colors the native checkbox check */
  flex-shrink: 0;
  cursor: pointer;
}

.modal__checkbox-title {
  display: block;
  font-size: 0.9rem;
  color: #f0e9da;
}

.modal__checkbox-desc {
  display: block;
  font-size: 0.78rem;
  color: #8b87a6;
  margin-top: 0.1rem;
}

.modal__actions {
  display: flex;
  gap: 0.75rem;
}

.modal__btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.modal__btn:hover {
  border-color: #d4a24c;
  color: #d4a24c;
}

.modal__btn--primary {
  background: #3fa796;
  border-color: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.modal__btn--primary:hover {
  color: #14131f;
  opacity: 0.9;
}
</style>