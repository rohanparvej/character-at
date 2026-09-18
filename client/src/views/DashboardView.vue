<!--
  DashboardView.vue
  --------------------
  The main authenticated-or-guest landing spot after signup/login/guest
  entry. Fetches characters on mount, renders the grid, handles the
  edit/delete events bubbled up from each CharacterTile.
-->
<template>
  <div class="dashboard-page">
    <AppNav />

    <main class="dashboard">
      <GuestBanner v-if="!authStore.isAuthenticated" />

      <header class="dashboard__header fade-up">
        <div>
          <h1 class="dashboard__title">
            <TypewriterText text="Your Characters" />
          </h1>
          <p class="dashboard__subtitle">
            {{ characterStore.characters.length }} character{{ characterStore.characters.length === 1 ? '' : 's' }} stored on this device
          </p>
        </div>
        <div class="dashboard__header-actions">
          <button class="dashboard__import-btn" @click="triggerImport">Import</button>
          <router-link to="/characters/new" class="dashboard__add-btn">+ New Character</router-link>
        </div>
      </header>

      <!-- Hidden file input — triggered programmatically by the Import
           button above rather than styled directly, since native file
           inputs are notoriously hard to style consistently. -->
      <input
        ref="fileInputRef"
        type="file"
        accept="application/json"
        class="dashboard__file-input"
        @change="handleFileSelected"
      />

      <p v-if="importMessage" class="dashboard__import-message">{{ importMessage }}</p>
      <p v-if="importError" class="dashboard__import-error">{{ importError }}</p>

      <!-- Cloud library export — only meaningful once characters exist
           in MongoDB, which requires the sync endpoint you'll build.
           Button works today, but will return an empty file until then. -->
      <div v-if="authStore.isAuthenticated" class="dashboard__cloud-actions">
        <button class="dashboard__cloud-btn" :disabled="isExportingLibrary" @click="handleExportLibrary">
          {{ isExportingLibrary ? 'Exporting…' : 'Export My Library (Cloud)' }}
        </button>
        <p v-if="libraryExportError" class="dashboard__cloud-error">{{ libraryExportError }}</p>
      </div>

      <StatsStrip v-if="characterStore.characters.length > 0" :characters="characterStore.characters" />

      <!-- Loading state — skeleton tiles matching the real grid's shape,
           so there's no layout jump once actual characters replace them -->
      <div v-if="characterStore.isLoading" class="dashboard__grid">
        <SkeletonTile v-for="n in 3" :key="n" />
      </div>

      <!-- Empty state — first-time users need a clear nudge, not just a blank grid -->
      <div v-else-if="characterStore.characters.length === 0" class="dashboard__empty">
        <p class="dashboard__empty-text">No characters yet. Start with your first one.</p>
        <router-link to="/characters/new" class="dashboard__add-btn">+ New Character</router-link>
      </div>

      <!-- Character grid -->
      <div v-else class="dashboard__grid">
        <CharacterTile
          v-for="character in characterStore.characters"
          :key="character.id"
          :character="character"
          @edit="handleEdit"
          @delete="handleDelete"
          @update-visibility="handleUpdateVisibility"
        />
      </div>

      <PrivacyFooterPanel />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/characters'
import { useAuthStore } from '../stores/auth'
import characterService from '../services/characterService'
import { exportLibraryAsFile } from '../utils/exportCharacter'
import { parseCharacterImportFile } from '../utils/importCharacter'
import CharacterTile from '../components/dashboard/CharacterTile.vue'
import SkeletonTile from '../components/dashboard/SkeletonTile.vue'
import AppNav from '../components/layout/AppNav.vue'
import GuestBanner from '../components/dashboard/GuestBanner.vue'
import StatsStrip from '../components/dashboard/StatsStrip.vue'
import PrivacyFooterPanel from '../components/dashboard/PrivacyFooterPanel.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const authStore = useAuthStore()

// --- Import ---
const fileInputRef = ref(null)
const importMessage = ref('')
const importError = ref('')

function triggerImport() {
  importMessage.value = ''
  importError.value = ''
  fileInputRef.value?.click() // opens the native file picker
}

async function handleFileSelected(event) {
  const file = event.target.files[0]
  event.target.value = '' // reset so re-selecting the SAME file still fires @change next time
  if (!file) return

  try {
    const normalized = await parseCharacterImportFile(file)
    const { importedCount, renamedCount } = await characterStore.importCharacters(normalized)

    importMessage.value = `Imported ${importedCount} character${importedCount === 1 ? '' : 's'}.`
    if (renamedCount > 0) {
      importMessage.value += ` ${renamedCount} had a matching id already in your library and were imported as new copies.`
    }
  } catch (err) {
    importError.value = err.message || 'Could not import that file.'
    console.error(err)
  }
}

const isExportingLibrary = ref(false)
const libraryExportError = ref('')

async function handleExportLibrary() {
  isExportingLibrary.value = true
  libraryExportError.value = ''
  try {
    const characters = await characterService.exportLibraryFromCloud()
    exportLibraryAsFile(characters)
  } catch (err) {
    libraryExportError.value = 'Could not export your cloud library right now.'
    console.error(err)
  } finally {
    isExportingLibrary.value = false
  }
}

// Load characters from IndexedDB as soon as this view mounts.
onMounted(() => {
  characterStore.fetchAll()
})

function handleEdit(id) {
  router.push(`/characters/${id}/edit`)
}

async function handleDelete(id) {
  // Simple native confirm — fine for now, revisit with a styled modal
  // later if you want something nicer than the browser's default dialog.
  const confirmed = confirm('Delete this character? This cannot be undone.')
  if (!confirmed) return
  await characterStore.deleteCharacter(id)
}

async function handleUpdateVisibility({ id, visibility }) {
  await characterStore.updateCharacter(id, { cardVisibility: visibility })
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #14131f; /* ink-950 */
}

.dashboard {
  padding: 1rem 1.5rem 2.5rem;
  max-width: 72rem;
  margin: 0 auto;
}

.dashboard__header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.dashboard__title {
  font-family: 'Fraunces', serif;
  font-size: 1.75rem;
  color: #f0e9da;
}

.dashboard__subtitle {
  font-size: 0.85rem;
  color: #8b87a6;
  margin-top: 0.25rem;
}

.dashboard__header-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.dashboard__add-btn {
  background: #3fa796;
  color: #14131f;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.dashboard__add-btn:hover {
  transform: translateY(-2px);
}

.dashboard__import-btn {
  padding: 0.65rem 1.1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.dashboard__import-btn:hover {
  border-color: #3fa796;
  color: #3fa796;
}

/* Native file inputs can't be styled consistently across browsers, so
   it's visually hidden and triggered via fileInputRef.click() instead —
   NOT display:none, which some browsers block from being triggered
   programmatically for accessibility reasons. */
.dashboard__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.dashboard__import-message {
  font-size: 0.8rem;
  color: #3fa796; /* signal-teal */
  margin-bottom: 1rem;
}

.dashboard__import-error {
  font-size: 0.8rem;
  color: #c1432b;
  margin-bottom: 1rem;
}

.dashboard__cloud-actions {
  margin-bottom: 1.75rem;
}

.dashboard__cloud-btn {
  padding: 0.55rem 1rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(212, 162, 76, 0.4);
  background: transparent;
  color: #d4a24c; /* quill-gold */
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.dashboard__cloud-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dashboard__cloud-error {
  font-size: 0.75rem;
  color: #c1432b;
  margin-top: 0.5rem;
}

.dashboard__status {
  color: #8b87a6;
  text-align: center;
  padding: 3rem 0;
}

.dashboard__empty {
  text-align: center;
  padding: 4rem 0;
}

.dashboard__empty-text {
  color: #8b87a6;
  margin-bottom: 1.25rem;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .dashboard__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>