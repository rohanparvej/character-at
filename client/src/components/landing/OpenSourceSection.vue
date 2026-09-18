<!--
  OpenSourceSection.vue
  ------------------------
  Points to the GitHub repo. Update the href once the real repo exists —
  it's a placeholder right now.
-->
<template>
  <section class="oss">
    <div class="oss__inner">
      <h2 class="oss__heading">Built in the open</h2>
      <p class="oss__body">
        characterAt is free and open source, released under the MIT license.
        Read the code, file an issue, or open a pull request — every contribution helps.
      </p>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="oss__link"
      >
        View on GitHub →
      </a>
    </div>
  </section>
</template>

<script setup>
// Static section — replace the href above with your real repo URL.
</script>

<style scoped>
.oss {
  padding: 4rem 1.5rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
  text-align: center;
}

.oss__inner {
  max-width: 36rem;
  margin: 0 auto;
}

.oss__heading {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #f0e9da;
  margin-bottom: 1rem;
}

.oss__body {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #b8b4cc;
  margin-bottom: 1.75rem;
}

.oss__link {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(212, 162, 76, 0.5);
  color: #d4a24c; /* quill-gold */
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.oss__link:hover {
  transform: translateY(-2px);
}
</style>