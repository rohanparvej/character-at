<!--
  LandingView.vue
  ----------------
  This is the page-level component mapped to route "/".
  It stays intentionally thin — just composes the landing sections
  in order. All real content/logic lives inside each child component.

  Why split like this instead of one big file:
  - Each section (Hero, Features, Footer) can be edited/reviewed alone
  - Easy to reorder sections by just moving lines here
  - Matches the project's "modular, not one giant file" requirement
-->
<template>
  <main class="landing">
    <LandingHeader />
    <HeroSection />
    <FeatureGrid />
    <PrivacySection />
    <TechStackSection />
    <OpenSourceSection />
    <AppFooter />
  </main>
</template>

<script setup>
import LandingHeader from '../components/landing/LandingHeader.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import FeatureGrid from '../components/landing/FeatureGrid.vue'
import PrivacySection from '../components/landing/PrivacySection.vue'
import TechStackSection from '../components/landing/TechStackSection.vue'
import OpenSourceSection from '../components/landing/OpenSourceSection.vue'
import AppFooter from '../components/landing/AppFooter.vue'
</script>

<style scoped>
/* Sets the page background + default text color.
   These CSS vars/colors mirror the tailwind.config.js tokens
   (see tailwind.config.snippet.js) so both styling approaches agree. */
.landing {
  min-height: 100vh;
  background: #14131f; /* ink-950 */
  color: #b8b4cc;
}
</style>