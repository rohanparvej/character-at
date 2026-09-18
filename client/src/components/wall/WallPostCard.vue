<!--
  WallPostCard.vue
  -------------------
  Displays one wall post. Unlike CharacterTile (which shows YOUR full
  local data), this only shows what was actually included in the
  snapshot — backstory/bookmarks/dialogues sections render only if
  they have content, since an empty backstory here genuinely means
  "not shared," not "shared but blank" (see stores/wall.js's postCharacter).
-->
<template>
  <div class="wall-card">
    <div class="wall-card__header">
      <div class="wall-card__avatar" :style="{ background: avatarColor }">{{ initials }}</div>
      <div>
        <div class="wall-card__type">{{ post.characterType || 'Unspecified' }}</div>
        <h3 class="wall-card__name">{{ post.name }}</h3>
      </div>
    </div>

    <div v-if="post.emojis?.length" class="wall-card__emojis">
      <span v-for="(emoji, i) in post.emojis" :key="i">{{ emoji }}</span>
    </div>

    <p v-if="post.premise" class="wall-card__premise">{{ post.premise }}</p>

    <div v-if="post.tags?.length" class="wall-card__tags">
      <span v-for="tag in post.tags" :key="tag" class="wall-card__tag">{{ tag }}</span>
    </div>

    <!-- Optional sections — only shown if actually included in this post -->
    <div v-if="post.backstory" class="wall-card__section">
      <span class="wall-card__section-label">Backstory</span>
      <p class="wall-card__section-text">{{ post.backstory }}</p>
    </div>

    <div v-if="post.bookmarks?.length" class="wall-card__section">
      <span class="wall-card__section-label">Chapter Bookmarks</span>
      <p v-for="(b, i) in post.bookmarks" :key="i" class="wall-card__section-text">
        <strong>{{ b.label }}</strong><span v-if="b.note"> — {{ b.note }}</span>
      </p>
    </div>

    <div v-if="post.dialogues?.length" class="wall-card__section">
      <span class="wall-card__section-label">Dialogues</span>
      <p v-for="(d, i) in post.dialogues" :key="i" class="wall-card__section-text wall-card__section-text--quote">
        "{{ d.text }}"
      </p>
    </div>

    <!-- Rating + reaction row. Always shows the current aggregate
         (avgRating/reactionCount) as read-only stats. Only shows
         CLICKABLE stars/pen when interactive=true — i.e. you're
         looking at a FRIEND's wall, not your own (rating your own
         card isn't offered). -->
    <div class="wall-card__interactions">
      <div class="wall-card__rating">
        <template v-if="interactive">
          <button
            v-for="star in 5"
            :key="star"
            class="wall-card__star"
            :class="{ 'wall-card__star--filled': star <= (hoverRating || post.myRating || 0) }"
            :aria-label="`Rate ${star} star${star === 1 ? '' : 's'}`"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            @click="$emit('rate', post._id, star)"
          >
            ★
          </button>
        </template>
        <template v-else>
          <span v-for="star in 5" :key="star" class="wall-card__star" :class="{ 'wall-card__star--filled': star <= Math.round(post.avgRating || 0) }">★</span>
        </template>
        <span class="wall-card__rating-text">
          {{ post.avgRating !== null ? post.avgRating : '—' }}
          <span v-if="post.ratingCount">({{ post.ratingCount }})</span>
        </span>
      </div>

      <!-- The pen emoji IS this app's "like" button, per the product
           decision — not a heart/thumbs-up. -->
      <button
        class="wall-card__pen"
        :class="{ 'wall-card__pen--active': post.iReacted }"
        :disabled="!interactive"
        @click="interactive && $emit('react', post._id)"
      >
        🖊️ <span>{{ post.reactionCount || 0 }}</span>
      </button>
    </div>

    <!-- Only rendered when the parent provides a remove handler — lets
         this same component be reused later for viewing FRIENDS' walls
         (where a remove button wouldn't make sense) without changes. -->
    <button v-if="showRemove" class="wall-card__remove" @click="$emit('remove', post._id)">
      Remove from wall
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAvatarColor, getInitials } from '../../utils/avatar'

const props = defineProps({
  post: { type: Object, required: true },
  showRemove: { type: Boolean, default: false },
  // true on a friend's wall (you can rate/react), false on your own
  // wall (read-only stats only) — see MyWallView.vue vs FriendWallView.vue.
  interactive: { type: Boolean, default: false },
})
defineEmits(['remove', 'rate', 'react'])

// Live preview while hovering over the stars, before you actually
// click one — falls back to your existing rating (post.myRating) when
// not hovering, or 0 (no stars filled) if you haven't rated at all.
const hoverRating = ref(0)

// Seeded on characterLocalId so the color matches the same character's
// avatar everywhere else in the app (dashboard tile, detail page).
const avatarColor = computed(() => getAvatarColor(props.post.characterLocalId))
const initials = computed(() => getInitials(props.post.name))
</script>

<style scoped>
.wall-card {
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(139, 135, 166, 0.15);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.wall-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.wall-card__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  color: #14131f;
  flex-shrink: 0;
}

.wall-card__type {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4a24c;
}

.wall-card__name {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  color: #f0e9da;
}

.wall-card__emojis {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.wall-card__premise {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #b8b4cc;
  margin-bottom: 0.9rem;
}

.wall-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.wall-card__tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(63, 167, 150, 0.12);
  color: #3fa796;
}

.wall-card__section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
}

.wall-card__section-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b87a6;
  display: block;
  margin-bottom: 0.4rem;
}

.wall-card__section-text {
  font-size: 0.82rem;
  line-height: 1.55;
  color: #d8d4e8;
  margin-bottom: 0.4rem;
}

.wall-card__section-text--quote {
  font-family: 'Fraunces', serif;
  font-style: italic;
}

.wall-card__interactions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
}

.wall-card__rating {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.wall-card__star {
  background: none;
  border: none;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  color: rgba(139, 135, 166, 0.35); /* empty star */
  cursor: default;
}

/* Only clickable stars (interactive=true) get pointer + hover feedback —
   read-only stars (your own wall) stay inert, matching cursor: default above. */
button.wall-card__star {
  cursor: pointer;
  transition: transform 0.1s ease;
}

button.wall-card__star:hover {
  transform: scale(1.15);
}

.wall-card__star--filled {
  color: #d4a24c; /* quill-gold */
}

.wall-card__rating-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #8b87a6;
  margin-left: 0.4rem;
}

.wall-card__pen {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid rgba(139, 135, 166, 0.3);
  border-radius: 9999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  color: #b8b4cc;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.wall-card__pen:disabled {
  cursor: default;
}

.wall-card__pen:not(:disabled):hover {
  border-color: #3fa796;
}

.wall-card__pen--active {
  background: rgba(63, 167, 150, 0.15);
  border-color: #3fa796;
  color: #3fa796;
}

.wall-card__remove {
  margin-top: 1.25rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #8b87a6;
  font-size: 0.78rem;
  cursor: pointer;
}

.wall-card__remove:hover {
  border-color: #c1432b;
  color: #c1432b;
}
</style>