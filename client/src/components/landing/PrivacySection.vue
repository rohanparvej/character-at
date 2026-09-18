<!--
  PrivacySection.vue
  ---------------------
  Dedicated section explaining the local-first / no-server-by-default
  model — this is a core differentiator of the product, worth its own
  section rather than being buried in FeatureGrid's short blurb.
-->
<template>
  <section id="privacy" class="privacy">
    <div class="privacy__inner">
      <span class="privacy__eyebrow">Privacy, by default</span>
      <h2 class="privacy__heading">Nothing leaves your browser unless you say so</h2>
      <p class="privacy__body">
        Every character you create lives in this browser's local storage — not on our servers.
        You can export any character (or your whole library) as a file, delete it locally, and
        re-import it later on this device or another. Signing up is entirely optional, and only
        needed to unlock friend requests, card trading, and ratings — features that genuinely
        require a shared server to work.
      </p>

      <div class="privacy__grid">
        <div class="privacy__item">
          <h3 class="privacy__item-title">Local by default</h3>
          <p class="privacy__item-text">Guest mode stores everything in IndexedDB, on your device only.</p>
        </div>
        <div class="privacy__item">
          <h3 class="privacy__item-title">Export anytime</h3>
          <p class="privacy__item-text">Download any character as a plain JSON file — yours to keep, move, or back up.</p>
        </div>
        <div class="privacy__item">
          <h3 class="privacy__item-title">Self-host it</h3>
          <p class="privacy__item-text">Run the whole app on your own machine for full control — no official server involved at all.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No logic — static content section.
</script>

<style scoped>
.privacy {
  padding: 4rem 1.5rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
}

.privacy__inner {
  max-width: 48rem;
  margin: 0 auto;
  text-align: center;
}

.privacy__eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3fa796; /* signal-teal */
}

.privacy__heading {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #f0e9da;
  margin: 0.75rem 0 1.25rem;
}

.privacy__body {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #b8b4cc;
  margin-bottom: 2.5rem;
}

.privacy__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  text-align: left;
}

@media (min-width: 700px) {
  .privacy__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.privacy__item {
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.15);
  border-radius: 0.6rem;
  padding: 1.25rem;
}

.privacy__item-title {
  font-family: 'Fraunces', serif;
  font-size: 1rem;
  color: #d4a24c; /* quill-gold */
  margin-bottom: 0.4rem;
}

.privacy__item-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #8b87a6;
}
</style>