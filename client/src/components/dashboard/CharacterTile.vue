<!--
  CharacterTile.vue
  -------------------
  One character shown in the dashboard grid. Kept "dumb" like
  FeatureCard.vue was — receives a character object as a prop, emits
  events for actions, doesn't talk to the store or router directly.

  REDESIGN NOTE: now includes an initials avatar (deterministic color
  via utils/avatar.js) and an emoji row. The avatar + name together
  form one clickable link to the detail page — same destination the
  name-only link went to before, just a bigger click target now.
-->
<template>
  <div class="tile">
    <div class="tile__top-row">
      <router-link :to="`/characters/${character.id}`" class="tile__header-link">
        <div class="tile__avatar" :style="{ background: avatarColor }">{{ initials }}</div>
        <div class="tile__header-text">
          <div class="tile__type">{{ character.characterType || 'Unspecified' }}</div>
          <h3 class="tile__name">{{ character.name }}</h3>
        </div>
      </router-link>

      <!-- Gear icon — opens the card sharing settings checklist without
           navigating away from the dashboard -->
      <button class="tile__settings-btn" aria-label="Card sharing settings" @click="isSettingsOpen = true">
        ⚙
      </button>
    </div>

    <!-- Emoji row — only rendered if the character has any set -->
    <div v-if="character.emojis?.length" class="tile__emojis">
      <span v-for="(emoji, index) in character.emojis" :key="index" class="tile__emoji">{{ emoji }}</span>
    </div>

    <p class="tile__premise">{{ character.premise }}</p>

    <div v-if="character.tags?.length" class="tile__tags">
      <span v-for="tag in character.tags" :key="tag" class="tile__tag">{{ tag }}</span>
    </div>

    <div class="tile__actions">
      <!-- Emits rather than routing directly — DashboardView decides
           what "edit" and "delete" actually do -->
      <button class="tile__btn" @click="$emit('edit', character.id)">Edit</button>
      <button class="tile__btn tile__btn--danger" @click="$emit('delete', character.id)">
        Delete
      </button>
    </div>

    <CardVisibilityModal
      v-if="isSettingsOpen"
      :character="character"
      @close="isSettingsOpen = false"
      @save="handleSaveVisibility"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAvatarColor, getInitials } from '../../utils/avatar'
import CardVisibilityModal from './CardVisibilityModal.vue'

const props = defineProps({
  character: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'delete', 'update-visibility'])

// Seeded on character.id (not name) so the color stays stable even if
// the user later renames the character via "Edit basics."
const avatarColor = computed(() => getAvatarColor(props.character.id))
const initials = computed(() => getInitials(props.character.name))

const isSettingsOpen = ref(false)

function handleSaveVisibility(visibilitySettings) {
  // Bubbles up rather than calling the store directly — stays consistent
  // with the "dumb component" pattern the rest of this file already follows.
  emit('update-visibility', { id: props.character.id, visibility: visibilitySettings })
  isSettingsOpen.value = false
}
</script>

<style scoped>
.tile {
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.15);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.tile:hover {
  border-color: rgba(212, 162, 76, 0.4); /* quill-gold */
  transform: translateY(-4px);
}

.tile__top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.tile__header-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0; /* allows the name inside to truncate instead of pushing the gear icon out */
  flex: 1;
}

.tile__settings-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
  transition: color 0.2s ease, transform 0.2s ease;
}

.tile__settings-btn:hover {
  color: #d4a24c; /* quill-gold */
  transform: rotate(30deg);
}

.tile__avatar {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #14131f; /* dark text reads well on all palette colors used */
}

.tile__header-text {
  min-width: 0; /* allows text truncation to work inside a flex child */
}

.tile__type {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4a24c; /* quill-gold */
}

.tile__name {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  color: #f0e9da; /* parchment */
  transition: color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile__header-link:hover .tile__name {
  color: #3fa796; /* signal-teal, signals it's clickable */
}

.tile__emojis {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.tile__premise {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #b8b4cc;
  margin-bottom: 1rem;
  /* Clamp to 3 lines so long premises don't blow up tile height in the grid */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.tile__tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(63, 167, 150, 0.12);
  color: #3fa796; /* signal-teal */
}

.tile__actions {
  display: flex;
  gap: 0.5rem;
}

.tile__btn {
  flex: 1;
  padding: 0.45rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.tile__btn:hover {
  border-color: #3fa796;
  color: #3fa796;
}

.tile__btn--danger:hover {
  border-color: #c1432b;
  color: #c1432b;
}
</style>