<!--
  TechStackSection.vue
  -----------------------
  Shows off the stack. Uses plain text badges rather than official
  Vue/Express/MongoDB logo marks — those are trademarked assets, and a
  text badge conveys the same information without any IP concerns.
-->
<template>
  <section class="stack">
    <div class="stack__inner">
      <span class="stack__eyebrow">100% free & open source</span>
      <h2 class="stack__heading">Built with tools anyone can use</h2>

      <div class="stack__badges">
        <span v-for="tech in stack" :key="tech.name" class="stack__badge">
          <span class="stack__badge-name">{{ tech.name }}</span>
          <span class="stack__badge-role">{{ tech.role }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
const stack = [
  { name: 'Vue 3', role: 'Frontend' },
  { name: 'Tailwind CSS v4', role: 'Styling' },
  { name: 'Express', role: 'Backend' },
  { name: 'MongoDB', role: 'Database' },
]
</script>

<style scoped>
.stack {
  padding: 4rem 1.5rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
  text-align: center;
}

.stack__eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #d4a24c; /* quill-gold */
}

.stack__heading {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #f0e9da;
  margin: 0.75rem 0 2rem;
}

.stack__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.stack__badge {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1.1rem;
  min-width: 8rem;
}

.stack__badge-name {
  font-family: 'Fraunces', serif;
  font-size: 0.95rem;
  color: #f0e9da;
}

.stack__badge-role {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #3fa796; /* signal-teal */
  margin-top: 0.2rem;
}
</style>