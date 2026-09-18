<!--
  SkeletonTile.vue
  -------------------
  Loading placeholder shaped like a real CharacterTile (avatar circle,
  name line, a couple of text lines, tag pills) — replaces the old
  plain "Loading…" text. A shimmering block reads as "content is
  coming" far more clearly than a text label does.
-->
<template>
  <div class="skeleton-tile">
    <div class="skeleton-tile__header">
      <div class="skeleton-tile__avatar shimmer" />
      <div class="skeleton-tile__header-text">
        <div class="skeleton-tile__line skeleton-tile__line--short shimmer" />
        <div class="skeleton-tile__line skeleton-tile__line--medium shimmer" />
      </div>
    </div>
    <div class="skeleton-tile__line shimmer" />
    <div class="skeleton-tile__line skeleton-tile__line--medium shimmer" />
    <div class="skeleton-tile__tags">
      <div class="skeleton-tile__pill shimmer" />
      <div class="skeleton-tile__pill shimmer" />
    </div>
  </div>
</template>

<script setup>
// No props/logic — purely decorative, used in a v-for with no key data needed.
</script>

<style scoped>
.skeleton-tile {
  background: #201f33; /* ink-800, matches real tiles */
  border: 1px solid rgba(139, 135, 166, 0.15);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.skeleton-tile__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.skeleton-tile__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.skeleton-tile__header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skeleton-tile__line {
  height: 0.65rem;
  border-radius: 0.2rem;
  background: rgba(139, 135, 166, 0.15);
  margin-bottom: 0.6rem;
  width: 100%;
}

.skeleton-tile__line--short {
  width: 40%;
}

.skeleton-tile__line--medium {
  width: 70%;
}

.skeleton-tile__tags {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.skeleton-tile__pill {
  width: 3.5rem;
  height: 1.1rem;
  border-radius: 0.25rem;
  background: rgba(139, 135, 166, 0.15);
}

/* Shimmer: a light band sweeps left-to-right across each block,
   implemented as a moving gradient rather than a JS-driven animation —
   cheap, GPU-friendly, and self-contained in CSS. */
.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(240, 233, 218, 0.06) 50%,
    transparent 100%
  );
  animation: shimmer-sweep 1.6s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>