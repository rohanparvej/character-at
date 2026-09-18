<!--
  TypewriterText.vue
  ---------------------
  Renders `text` one character at a time on mount, then leaves a
  blinking cursor. Deliberately renders as a plain <span> with no font
  styling of its own — it inherits whatever the parent element (e.g.
  an <h1>) already applies, so it drops into existing markup without
  fighting for style control.
-->
<template>
  <span class="typewriter">
    <span>{{ displayedText }}</span>
    <span v-if="!isDone" class="typewriter__cursor" aria-hidden="true">|</span>
  </span>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  speedMs: { type: Number, default: 45 }, // time between each character
})

const displayedText = ref('')
const isDone = ref(false)
let intervalId = null

onMounted(() => {
  let index = 0
  intervalId = setInterval(() => {
    index++
    displayedText.value = props.text.slice(0, index)
    if (index >= props.text.length) {
      clearInterval(intervalId)
      isDone.value = true
    }
  }, props.speedMs)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.typewriter__cursor {
  display: inline-block;
  margin-left: 0.1rem;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>