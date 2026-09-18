<!--
  CharacterDetailView.vue
  --------------------------
  The character "dossier" — header recap + tabbed sections for
  Backstory, Bookmarks, and Dialogues. This is where deep character
  work happens; the create/edit form (CharacterFormView) stays focused
  on just the card-facing basics.
-->
<template>
  <div class="detail-page">
    <AppNav />

    <main v-if="character" class="detail">
      <router-link to="/dashboard" class="detail__back">← Back to dashboard</router-link>

      <!-- Header recap — read-only here, edited via the basics form -->
      <header class="detail__header">
        <div class="detail__header-top">
          <span class="detail__type">{{ character.characterType || 'Unspecified' }}</span>
          <router-link :to="`/characters/${character.id}/edit`" class="detail__edit-link">
            Edit basics
          </router-link>
        </div>
        <h1 class="detail__name">{{ character.name }}</h1>
        <p v-if="character.premise" class="detail__premise">{{ character.premise }}</p>
        <div v-if="character.tags?.length" class="detail__tags">
          <span v-for="tag in character.tags" :key="tag" class="detail__tag">{{ tag }}</span>
        </div>

        <!-- Save/export actions — per your decision, guests only see
             Export; logged-in users see both, choice stays with the user -->
        <div class="detail__save-actions">
          <button class="detail__action-btn" @click="handleExport">Export to File</button>
          <button
            v-if="authStore.isAuthenticated"
            class="detail__action-btn"
            :disabled="isExportingFromCloud"
            @click="handleExportFromCloud"
          >
            {{ isExportingFromCloud ? 'Exporting…' : 'Export from Cloud' }}
          </button>
          <button
            v-if="authStore.isAuthenticated"
            class="detail__action-btn detail__action-btn--primary"
            :disabled="isSyncing"
            @click="handleSaveToCloud"
          >
            {{ isSyncing ? 'Saving…' : 'Save to Cloud' }}
          </button>
          <!-- Post to Wall — uses the character's cardVisibility flags
               (set via the gear icon on the dashboard) to decide which
               optional sections to include. See stores/wall.js's
               postCharacter for exactly how that filtering works. -->
          <button
            v-if="authStore.isAuthenticated"
            class="detail__action-btn"
            :disabled="isPostingToWall"
            @click="handlePostToWall"
          >
            {{ isPostingToWall ? 'Posting…' : 'Post to Wall' }}
          </button>
        </div>
        <p v-if="syncError" class="detail__sync-error">{{ syncError }}</p>
        <p v-if="cloudExportError" class="detail__sync-error">{{ cloudExportError }}</p>
        <p v-if="wallPostMessage" class="detail__wall-message">{{ wallPostMessage }}</p>
        <p v-if="wallPostError" class="detail__sync-error">{{ wallPostError }}</p>
      </header>

      <SaveNotice :visible="noticeVisible" :message="noticeMessage" />

      <!-- Folder-style tab bar -->
      <div class="detail__tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="detail__tab"
          :class="{ 'detail__tab--active': activeTab === tab.id }"
          role="tab"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab panel — the connecting border makes the active tab feel
           attached to this panel, completing the folder illusion -->
      <div class="detail__panel">
        <BackstorySection v-if="activeTab === 'backstory'" :backstory="character.backstory || ''" @save="handleSaveBackstory" />
        <BookmarksSection
          v-else-if="activeTab === 'bookmarks'"
          :bookmarks="character.bookmarks || []"
          @add="handleAddBookmark"
          @delete="handleDeleteBookmark"
          @reorder="handleReorderBookmarks"
        />
        <DialoguesSection
          v-else-if="activeTab === 'dialogues'"
          :dialogues="character.dialogues || []"
          @add="handleAddDialogue"
          @delete="handleDeleteDialogue"
        />
      </div>
    </main>

    <p v-else-if="!characterStore.isLoading" class="detail__not-found">
      Character not found.
      <router-link to="/dashboard">Return to dashboard</router-link>
    </p>

    <!-- Loading state — a skeleton shaped like the real header + tab
         panel below, rather than leaving the page blank while
         characterStore.fetchAll() resolves (see onMounted below). -->
    <div v-else class="detail">
      <div class="skeleton detail__skeleton-back" />
      <div class="detail__header">
        <div class="skeleton detail__skeleton-type" />
        <div class="skeleton detail__skeleton-name" />
        <div class="skeleton detail__skeleton-premise" />
        <div class="skeleton detail__skeleton-premise detail__skeleton-premise--short" />
      </div>
      <div class="detail__tabs">
        <div class="skeleton detail__skeleton-tab" />
        <div class="skeleton detail__skeleton-tab" />
        <div class="skeleton detail__skeleton-tab" />
      </div>
      <div class="detail__panel">
        <div class="skeleton detail__skeleton-line" />
        <div class="skeleton detail__skeleton-line" />
        <div class="skeleton detail__skeleton-line detail__skeleton-line--short" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCharacterStore } from '../stores/characters'
import { useAuthStore } from '../stores/auth'
import characterService from '../services/characterService'
import { useWallStore } from '../stores/wall'
import { exportCharacterAsFile } from '../utils/exportCharacter';
import AppNav from '../components/layout/AppNav.vue'
import BackstorySection from '../components/character-detail/BackstorySection.vue'
import BookmarksSection from '../components/character-detail/BookmarksSection.vue'
import DialoguesSection from '../components/character-detail/DialoguesSection.vue'
import SaveNotice from '../components/character-detail/SaveNotice.vue'

const route = useRoute()
const characterStore = useCharacterStore()
const authStore = useAuthStore()
const wallStore = useWallStore()

const tabs = [
  { id: 'backstory', label: 'Backstory' },
  { id: 'bookmarks', label: 'Chapter Bookmarks' },
  { id: 'dialogues', label: 'Dialogues' },
]
const activeTab = ref('backstory')

// Reactive lookup — since this is a computed reading from the store's
// array, it automatically updates whenever characterStore.updateCharacter
// replaces the entry (see stores/characters.js), no manual refresh needed.
const character = computed(() => characterStore.getById(route.params.id))

// IMPORTANT FIX: if this page is opened directly (refresh, bookmark,
// shared link) without visiting the dashboard first, the store is
// empty and getById() above would return undefined even for a real
// character. Load from IndexedDB here too, not just in DashboardView.
onMounted(async () => {
  if (characterStore.characters.length === 0) {
    await characterStore.fetchAll()
  }
})

// --- Save notice — appears after every local mutation, per your
// requirement that each change makes clear where it's actually stored ---
const noticeVisible = ref(false)
const noticeMessage = ref('')
let noticeTimeout = null

function showSaveNotice() {
  noticeMessage.value = authStore.isAuthenticated
    ? "Saved to your browser. Click 'Save to Cloud' above to sync this to your account."
    : 'Saved to your browser. This does not reach our servers — log in to sync/save to your account.'
  noticeVisible.value = true

  clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => {
    noticeVisible.value = false
  }, 5000)
}

function handleSaveBackstory(newBackstory) {
  characterStore.updateCharacter(character.value.id, { backstory: newBackstory })
  showSaveNotice()
}

function handleAddBookmark({ label, note }) {
  const newBookmark = { id: crypto.randomUUID(), label, note }
  const updatedBookmarks = [...(character.value.bookmarks || []), newBookmark]
  characterStore.updateCharacter(character.value.id, { bookmarks: updatedBookmarks })
  showSaveNotice()
}

function handleDeleteBookmark(bookmarkId) {
  const updatedBookmarks = (character.value.bookmarks || []).filter((b) => b.id !== bookmarkId)
  characterStore.updateCharacter(character.value.id, { bookmarks: updatedBookmarks })
  showSaveNotice()
}

function handleReorderBookmarks(reorderedBookmarks) {
  characterStore.updateCharacter(character.value.id, { bookmarks: reorderedBookmarks })
  showSaveNotice()
}

function handleAddDialogue({ text, note }) {
  const newDialogue = { id: crypto.randomUUID(), text, note }
  const updatedDialogues = [...(character.value.dialogues || []), newDialogue]
  characterStore.updateCharacter(character.value.id, { dialogues: updatedDialogues })
  showSaveNotice()
}

function handleDeleteDialogue(dialogueId) {
  const updatedDialogues = (character.value.dialogues || []).filter((d) => d.id !== dialogueId)
  characterStore.updateCharacter(character.value.id, { dialogues: updatedDialogues })
  showSaveNotice()
}

// --- Export / Cloud save ---
function handleExport() {
  exportCharacterAsFile(character.value)
}

const isExportingFromCloud = ref(false)
const cloudExportError = ref('')

async function handleExportFromCloud() {
  isExportingFromCloud.value = true
  cloudExportError.value = ''
  try {
    const cloudCharacter = await characterService.exportSingleCharacterFromCloud(character.value.id)
    exportCharacterAsFile(cloudCharacter)
  } catch (err) {
    // Expected if this character hasn't been synced to the cloud yet
    // (404 from the backend) — see characterExportController.js.
    cloudExportError.value = 'Could not find this character in your cloud account. Try "Save to Cloud" first.'
    console.error(err)
  } finally {
    isExportingFromCloud.value = false
  }
}

const isSyncing = ref(false)
const syncError = ref('')

// --- Post to Wall ---
const isPostingToWall = ref(false)
const wallPostMessage = ref('')
const wallPostError = ref('')

async function handlePostToWall() {
  isPostingToWall.value = true
  wallPostMessage.value = ''
  wallPostError.value = ''
  try {
    await wallStore.postCharacter(character.value)
    wallPostMessage.value = 'Posted to your wall.'
  } catch (err) {
    wallPostError.value = 'Could not post this card to your wall right now.'
    console.error(err)
  } finally {
    isPostingToWall.value = false
  }
}

async function handleSaveToCloud() {
  isSyncing.value = true
  syncError.value = ''
  try {
    await characterService.saveToCloud(character.value)
    noticeMessage.value = 'Synced to your account.'
    noticeVisible.value = true
    clearTimeout(noticeTimeout)
    noticeTimeout = setTimeout(() => (noticeVisible.value = false), 5000)
  } catch (err) {
    // Expected to fail until the backend route exists — see the
    // comment block at the top of characterService.js.
    syncError.value = 'Could not sync right now. (Backend endpoint not set up yet?)'
    console.error(err)
  } finally {
    isSyncing.value = false
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #14131f; /* ink-950 */
}

.detail {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0.5rem 1.5rem 4rem;
}

.detail__back {
  display: inline-block;
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.detail__back:hover {
  color: #f0e9da;
}

.detail__header {
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(212, 162, 76, 0.2);
  border-radius: 0.75rem 0.75rem 0 0; /* flat bottom corners — tabs sit right below */
  padding: 1.75rem;
}

.detail__header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detail__type {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4a24c; /* quill-gold */
}

.detail__edit-link {
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
}

.detail__edit-link:hover {
  color: #3fa796;
}

.detail__name {
  font-family: 'Fraunces', serif;
  font-size: 2rem;
  color: #f0e9da;
  margin-bottom: 0.6rem;
}

.detail__premise {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #b8b4cc;
  margin-bottom: 0.9rem;
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.detail__save-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(139, 135, 166, 0.15);
}

.detail__action-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.detail__action-btn:hover {
  border-color: #d4a24c;
  color: #d4a24c;
}

.detail__action-btn--primary {
  background: #3fa796;
  border-color: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.detail__action-btn--primary:hover {
  color: #14131f;
  opacity: 0.9;
}

.detail__action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detail__sync-error {
  font-size: 0.75rem;
  color: #c1432b;
  margin-top: 0.6rem;
}

.detail__wall-message {
  font-size: 0.75rem;
  color: #3fa796;
  margin-top: 0.6rem;
}

.detail__tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(63, 167, 150, 0.12);
  color: #3fa796;
}

/* --- Folder-style tabs --- */
.detail__tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0 0.5rem;
}

.detail__tab {
  padding: 0.6rem 1.1rem;
  border: 1px solid rgba(212, 162, 76, 0.2);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  background: #1a1929; /* between ink-950 and ink-800, sits "behind" active tab */
  color: #8b87a6;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
  position: relative;
  top: 1px; /* nudges down to visually merge with panel border below */
}

.detail__tab:hover {
  color: #d8d4e8;
}

.detail__tab--active {
  background: #201f33; /* matches panel background — creates the "attached" look */
  color: #f0e9da;
  border-color: rgba(212, 162, 76, 0.4);
}

.detail__panel {
  background: #201f33;
  border: 1px solid rgba(212, 162, 76, 0.2);
  border-radius: 0 0.75rem 0.75rem 0.75rem;
  padding: 1.75rem;
}

.detail__not-found {
  text-align: center;
  padding: 4rem 1.5rem;
  color: #8b87a6;
}

.detail__not-found a {
  color: #3fa796;
}

/* --- Loading skeleton — same shimmer technique as SkeletonTile.vue,
   duplicated here rather than shared, since this shape (header + tabs
   + panel) is specific to the detail page and used nowhere else. --- */
.skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 0.3rem;
  background: rgba(139, 135, 166, 0.15);
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(240, 233, 218, 0.06) 50%, transparent 100%);
  animation: skeleton-sweep 1.6s ease-in-out infinite;
}

@keyframes skeleton-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    animation: none;
  }
}

.detail__skeleton-back {
  width: 8rem;
  height: 0.8rem;
  margin-bottom: 1.5rem;
}

.detail__skeleton-type {
  width: 30%;
  height: 0.6rem;
  margin-bottom: 0.9rem;
}

.detail__skeleton-name {
  width: 55%;
  height: 1.6rem;
  margin-bottom: 0.9rem;
}

.detail__skeleton-premise {
  width: 100%;
  height: 0.8rem;
  margin-bottom: 0.5rem;
}

.detail__skeleton-premise--short {
  width: 65%;
}

.detail__skeleton-tab {
  width: 6rem;
  height: 2.2rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.detail__skeleton-line {
  width: 100%;
  height: 0.8rem;
  margin-bottom: 0.7rem;
}

.detail__skeleton-line--short {
  width: 40%;
  margin-bottom: 0;
}
</style>