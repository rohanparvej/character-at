<!--
  StatsStrip.vue
  ----------------
  Small "at a glance" row above the character grid. Purely derived
  from the characters array passed in — no store access of its own,
  keeps it reusable/testable in isolation.
-->
<template>
  <div class="stats-strip">
    <div class="stats-strip__item">
      <span class="stats-strip__number">{{ characters.length }}</span>
      <span class="stats-strip__label">Character{{ characters.length === 1 ? '' : 's' }}</span>
    </div>
    <div class="stats-strip__item">
      <span class="stats-strip__number">{{ uniqueTagCount }}</span>
      <span class="stats-strip__label">Unique Tags</span>
    </div>
    <div class="stats-strip__item">
      <span class="stats-strip__number">{{ typeCount }}</span>
      <span class="stats-strip__label">Character Types Used</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  characters: { type: Array, required: true },
})

const uniqueTagCount = computed(() => {
  const allTags = props.characters.flatMap((c) => c.tags || [])
  return new Set(allTags).size
})

const typeCount = computed(() => {
  const types = props.characters.map((c) => c.characterType).filter(Boolean)
  return new Set(types).size
})
</script>

<style scoped>
.stats-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(139, 135, 166, 0.15);
}

.stats-strip__item {
  display: flex;
  flex-direction: column;
}

.stats-strip__number {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem;
  color: #3fa796; /* signal-teal */
}

.stats-strip__label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b87a6;
}
</style>