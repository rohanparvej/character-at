<!--
  FeatureGrid.vue
  ----------------
  Renders the feature list below the hero. The `features` array is the
  single source of truth for copy — edit text here, layout stays untouched.
  Not using numbered markers (01/02/03) deliberately: these features
  aren't a sequence, so numbering them would imply an order that doesn't exist.
-->
<template>
  <section class="feature-section">
    <h2 class="feature-section__heading">Everything a character needs to feel real</h2>

    <div class="feature-grid">
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :description="feature.description"
      />
    </div>
  </section>
</template>

<script setup>
import FeatureCard from './FeatureCard.vue'

// Central data source for this section — add/remove a feature by
// editing this array only.
const features = [
  {
    icon: '📖',
    title: 'Full character dossiers',
    description: 'Premise, tags, backstory, and rough dialogue collections — all in one place per character.',
  },
  {
    icon: '🔖',
    title: 'Chapter bookmarks',
    description: 'Mark exactly where a character appears in your manuscript so you never lose the thread.',
  },
  {
    icon: '🃏',
    title: 'Shareable character cards',
    description: 'Turn a character into a clean visual card, ready to trade or show your writing circle.',
  },
  {
    icon: '⭐',
    title: 'Peer ratings',
    description: 'Ask friends to rate your characters based on their card, before they hit the page.',
  },
  {
    icon: '🔒',
    title: 'Local-first by default',
    description: "Nothing touches our servers unless you choose to sign up. Export, delete, re-import anytime.",
  },
  {
    icon: '🤝',
    title: 'Friend requests & trading',
    description: 'Find fellow writers, connect, and trade character cards to fuel your next project.',
  },
]
</script>

<style scoped>
.feature-section {
  max-width: 72rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.feature-section__heading {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #f0e9da;
  text-align: center;
  margin-bottom: 2.5rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>