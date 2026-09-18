<!--
  AppFooter.vue
  --------------
  Minimal footer. Mentions self-hosting + open source since that's a
  core part of the product's identity (per project requirements),
  not just a legal-links afterthought.
-->
<template>
  <footer class="footer">
    <p class="footer__text">
      characterPro is free and open source.
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="footer__link"
      >
        View the code / self-host it →
      </a>
    </p>
  </footer>
</template>

<script setup>
// Static footer, no logic needed yet.
// Replace the href above with the real repo URL once it exists.
</script>

<style scoped>
.footer {
  border-top: 1px solid rgba(139, 135, 166, 0.15);
  padding: 2rem 1.5rem;
  text-align: center;
}

.footer__text {
  font-size: 0.85rem;
  color: #8b87a6;
}

.footer__link {
  color: #d4a24c;
  text-decoration: none;
  border-bottom: 1px solid rgba(212, 162, 76, 0.4);
}

.footer__link:hover {
  color: #f0e9da;
}
</style>