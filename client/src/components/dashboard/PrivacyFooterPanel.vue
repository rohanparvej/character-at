<!--
  PrivacyFooterPanel.vue
  --------------------------
  Unlike SaveNotice (which appears briefly after an action) or
  GuestBanner (dismissible, top of page), this panel is ALWAYS present
  at the bottom of the dashboard — no fade, no dismiss. Its job is to
  make the storage model visible at all times, not just right after
  an edit, per the explicit requirement.
-->
<template>
  <div class="privacy-footer">
    <span class="privacy-footer__dot" />
    <p class="privacy-footer__text">
      Your character library lives in <strong>this browser's storage</strong>, not on our servers.
      Nothing is uploaded unless you sign up and explicitly click "Save to Cloud" on a character.
      <router-link to="/#privacy" class="privacy-footer__link">Learn more about how this works →</router-link>
    </p>
  </div>
</template>

<script setup>
// Static — no logic, always rendered when this component is used.
</script>

<style scoped>
.privacy-footer {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(63, 167, 150, 0.06); /* faint signal-teal wash, quieter than SaveNotice */
  border: 1px solid rgba(63, 167, 150, 0.2);
  border-radius: 0.6rem;
  padding: 1rem 1.25rem;
  margin-top: 3rem;
}

.privacy-footer__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: #3fa796; /* signal-teal */
  margin-top: 0.4rem;
  flex-shrink: 0;
}

.privacy-footer__text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #8b87a6; /* ink-faint — quieter than the page's primary text */
}

.privacy-footer__link {
  color: #d4a24c; /* quill-gold */
  font-weight: 600;
}
</style>