<!--
  CardStackDemo.vue
  ------------------
  This is the "signature element" of the landing page hero.
  Instead of describing what a character card is, we SHOW one —
  a small fanned stack of sample cards that react on hover.

  Why this exists as its own component:
  - Keeps HeroSection.vue focused on layout/copy, not animation detail
  - Makes it trivial to swap in real user card data later
    (the `cards` array below is just placeholder/demo data)
-->
<template>
  <div class="card-stack" aria-hidden="true">
    <!--
      v-for renders each demo card. The rotation/offset per card is
      computed inline so the "fan" effect scales with however many
      cards are in the array (currently 3, but not hardcoded to 3).
    -->
    <div
      v-for="(card, index) in cards"
      :key="card.name"
      class="demo-card"
      :style="cardTransform(index)"
    >
      <!-- Card header: name + character type acts like a card's "rank" -->
      <div class="demo-card__header">
        <span class="demo-card__type">{{ card.type }}</span>
        <span class="demo-card__rating">★ {{ card.rating }}</span>
      </div>

      <!-- Placeholder avatar circle (real cards will show uploaded image or icon) -->
      <div class="demo-card__avatar" :style="{ background: card.accent }">
        {{ card.initials }}
      </div>

      <h3 class="demo-card__name">{{ card.name }}</h3>
      <p class="demo-card__desc">{{ card.description }}</p>

      <!-- Adjective tags, styled like index-card stamps -->
      <div class="demo-card__tags">
        <span v-for="tag in card.tags" :key="tag" class="demo-card__tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Static demo data — purely for visual effect on the landing page.
// Not connected to any store or API; safe to edit freely for design tweaks.
const cards = [
  {
    name: 'Marlowe Finch',
    type: 'Protagonist',
    rating: 4.8,
    initials: 'MF',
    accent: '#3FA796',
    description: 'A disgraced cartographer who maps places that no longer exist.',
    tags: ['stubborn', 'nostalgic', 'sharp-tongued'],
  },
  {
    name: 'The Hollow Choir',
    type: 'Antagonist',
    rating: 4.5,
    initials: 'HC',
    accent: '#D4A24C',
    description: 'A collective of three voices that were once one person.',
    tags: ['eerie', 'patient', 'unified'],
  },
  {
    name: 'Priya Osei',
    type: 'Mentor',
    rating: 4.9,
    initials: 'PO',
    accent: '#C1432B',
    description: 'Runs a repair shop for things everyone else calls broken.',
    tags: ['warm', 'blunt', 'reliable'],
  },
]

// Computes a slight rotation + horizontal offset per card index
// so the stack "fans out" like cards held in a hand.
// index 0 = leftmost card, last index = rightmost card.
function cardTransform(index) {
  const middle = (cards.length - 1) / 2
  const offsetFromMiddle = index - middle
  const rotateDeg = offsetFromMiddle * 8 // degrees of fan per card
  const translateX = offsetFromMiddle * 40 // px spacing per card
  return {
    transform: `rotate(${rotateDeg}deg) translateX(${translateX}px)`,
    zIndex: index,
  }
}
</script>

<style scoped>
.card-stack {
  position: relative;
  height: 22rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-card {
  position: absolute;
  width: 12rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(212, 162, 76, 0.25); /* faint quill-gold border */
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.6);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

/* On hover of the whole stack, each card straightens and lifts slightly.
   This is the "bring characters alive" moment — cards react to the visitor. */
.card-stack:hover .demo-card {
  transform: translateY(-12px) rotate(0deg) !important;
}

.demo-card:hover {
  transform: translateY(-24px) scale(1.04) !important;
  z-index: 10 !important;
}

.demo-card__header {
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b87a6; /* ink-faint */
  margin-bottom: 0.75rem;
}

.demo-card__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  color: #14131f;
  margin-bottom: 0.75rem;
}

.demo-card__name {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem;
  color: #f0e9da; /* parchment */
  margin-bottom: 0.35rem;
}

.demo-card__desc {
  font-size: 0.75rem;
  color: #b8b4cc;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.demo-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.demo-card__tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(63, 167, 150, 0.12);
  color: #3fa796; /* signal-teal */
}
</style>