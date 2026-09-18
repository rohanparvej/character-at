<!--
  HeroSection.vue
  ----------------
  Top-of-page hero. Purely layout + copy — the actual "wow" visual
  (the animated card stack) is delegated to CardStackDemo.vue so this
  file stays easy to scan and edit copy in.
-->
<template>
  <section class="hero">
    <div class="hero__content">
      <!-- Eyebrow label — sets context before the headline lands -->
      <p class="hero__eyebrow">for novelists · screenwriters · game writers</p>

      <h1 class="hero__headline">
        <TypewriterText text="Your characters deserve " />
        <span class="hero__headline--accent">
          <TypewriterText v-if="showAccent" text="a proper file." />
        </span>
      </h1>

      <p class="hero__subhead">
        Build a living dossier for every character you write — premise, backstory,
        rough dialogue, chapter bookmarks — then turn it into a card worth trading
        with your writing circle.
      </p>

      <!-- CTAButtons is its own component since it's reused
           (e.g. could appear again in the footer or nav later) -->
      <CTAButtons />

      <p class="hero__note">
        No account needed to start. Your data stays in your browser until you say otherwise.
      </p>
    </div>

    <div class="hero__visual">
      <CardStackDemo />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CardStackDemo from './CardStackDemo.vue'
import CTAButtons from './CTAButtons.vue'
import TypewriterText from '../shared/TypewriterText.vue'

// The accent phrase ("a proper file.") only starts typing once the
// first phrase has finished, so the two read as one continuous
// sentence being typed rather than both animating at once.
const FIRST_PHRASE_LENGTH = 'Your characters deserve'.length
const TYPEWRITER_SPEED_MS = 45 // must match TypewriterText's default speedMs
const showAccent = ref(false)

onMounted(() => {
  setTimeout(() => {
    showAccent.value = true
  }, FIRST_PHRASE_LENGTH * TYPEWRITER_SPEED_MS + 150) // +150ms for a natural beat between phrases
})
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
  padding: 4rem 1.5rem 3rem;
  max-width: 72rem;
  margin: 0 auto;
}

/* Two-column layout once there's room for the card stack beside the text */
@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1.1fr 0.9fr;
    padding-top: 6rem;
  }
}

.hero__eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d4a24c; /* quill-gold */
  margin-bottom: 1rem;
}

.hero__headline {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.1;
  color: #f0e9da; /* parchment */
  margin-bottom: 1.25rem;
}

.hero__headline--accent {
  color: #3fa796; /* signal-teal */
  font-style: italic;
}

.hero__subhead {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #b8b4cc;
  max-width: 34rem;
  margin-bottom: 2rem;
}

.hero__note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #8b87a6; /* ink-faint */
}

.hero__visual {
  display: flex;
  justify-content: center;
}
</style>