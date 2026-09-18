<!--
  FeatureCard.vue
  ----------------
  One tile in the feature grid. Deliberately "dumb" — it only receives
  props and renders them. All the actual feature copy lives in
  FeatureGrid.vue's data array, so adding/editing a feature never
  requires touching this file.
-->
<template>
  <div class="feature-card">
    <!-- Emoji/icon kept simple + dependency-free (no icon library needed) -->
    <div class="feature-card__icon">{{ icon }}</div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__desc">{{ description }}</p>
  </div>
</template>

<script setup>
// defineProps with runtime validation — catches typos in FeatureGrid's
// data array early (e.g. forgetting to pass `description`).
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<style scoped>
.feature-card {
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.15);
  border-radius: 0.75rem;
  padding: 1.75rem;
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.feature-card:hover {
  border-color: rgba(212, 162, 76, 0.4); /* quill-gold on hover */
  transform: translateY(-4px);
}

.feature-card__icon {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}

.feature-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  color: #f0e9da;
  margin-bottom: 0.5rem;
}

.feature-card__desc {
  font-size: 0.9rem;
  line-height: 1.55;
  color: #b8b4cc;
}
</style>