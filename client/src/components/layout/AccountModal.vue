<!--
  AccountModal.vue
  -------------------
  View mode (default) shows account info read-only. Clicking "Edit"
  switches to an editable form for username/email — password change is
  deliberately NOT included, per the requirement, since that needs
  extra safeguards not built yet (confirming current password, etc.).
  Saving requires an explicit confirm step before the request fires.

  Closes via the × button, clicking the backdrop, or pressing Escape.
-->
<template>
  <!-- Teleport to <body> — same preventive fix as CardVisibilityModal.vue.
       AppNav doesn't currently have a hover-transform ancestor, but any
       modal is safer teleported out of its trigger's DOM subtree on
       principle, so this class of bug can't resurface if AppNav's
       styling changes later. -->
  <Teleport to="body">
    <!-- BUG FIX: removed @click.self="handleClose" here. It was closing
         the modal on ANY click on the dark overlay area — which, per
         your report, was interrupting edits (e.g. an accidental click
         near an edge while mid-edit, or between "Save Changes" and
         "Yes, Save", would silently dismiss the whole modal before the
         confirm step ever fired). Now only the × button and Escape close it. -->
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="Close" @click="handleClose">×</button>

        <div class="modal__avatar" :style="{ background: avatarColor }">{{ initials }}</div>

        <!-- VIEW MODE -->
        <template v-if="!isEditing">
          <h2 class="modal__username">{{ authStore.user.username }}</h2>

          <dl class="modal__fields">
            <div class="modal__field">
              <dt class="modal__label">Email</dt>
              <dd class="modal__value">{{ authStore.user.email }}</dd>
            </div>
            <div class="modal__field">
              <dt class="modal__label">Member since</dt>
              <dd class="modal__value">{{ formattedJoinDate }}</dd>
            </div>
          </dl>

          <button class="modal__btn modal__btn--primary" @click="startEdit">Edit Profile</button>
          <p class="modal__note">Password changes aren't available yet — coming in a future update.</p>
        </template>

        <!-- EDIT MODE -->
        <template v-else>
          <h2 class="modal__edit-title">Edit Profile</h2>

          <div class="modal__edit-field">
            <label for="edit-username" class="modal__label">Username</label>
            <input id="edit-username" v-model="draft.username" type="text" class="modal__input" />
          </div>
          <div class="modal__edit-field">
            <label for="edit-email" class="modal__label">Email</label>
            <input id="edit-email" v-model="draft.email" type="email" class="modal__input" />
          </div>

          <p v-if="fieldError" class="modal__error">{{ fieldError }}</p>
          <p v-if="authStore.error" class="modal__error">{{ authStore.error }}</p>

          <div class="modal__edit-actions">
            <button class="modal__btn modal__btn--primary" :disabled="authStore.isLoading" @click="handleSaveClick">
              {{ authStore.isLoading ? 'Saving…' : 'Save Changes' }}
            </button>
            <button class="modal__btn" @click="cancelEdit">Cancel</button>
          </div>
        </template>
      </div>

      <!-- Confirm-before-save step — same fix applied: no click-outside
           dismissal, only the explicit Cancel button. -->
      <div v-if="isConfirming" class="confirm-backdrop">
        <div class="confirm-box">
          <p class="confirm-box__text">Save these changes to your account?</p>
          <div class="confirm-box__actions">
            <button class="modal__btn modal__btn--primary" @click="confirmSave">Yes, Save</button>
            <button class="modal__btn" @click="isConfirming = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getAvatarColor, getInitials } from '../../utils/avatar'

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const avatarColor = computed(() => getAvatarColor(authStore.user.id))
const initials = computed(() => getInitials(authStore.user.username))

const formattedJoinDate = computed(() => {
  if (!authStore.user.createdAt) return 'Unknown'
  return new Date(authStore.user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// --- Edit mode ---
const isEditing = ref(false)
const isConfirming = ref(false)
const fieldError = ref('')
const draft = reactive({ username: '', email: '' })

function startEdit() {
  draft.username = authStore.user.username
  draft.email = authStore.user.email
  fieldError.value = ''
  authStore.error = null
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

// Basic client-side check before even offering the confirm step —
// mirrors the same validation the backend re-checks (see authController.js).
function handleSaveClick() {
  fieldError.value = ''
  if (draft.username.trim().length < 3) {
    fieldError.value = 'Username must be at least 3 characters.'
    return
  }
  if (!/^\S+@\S+\.\S+$/.test(draft.email)) {
    fieldError.value = 'Enter a valid email address.'
    return
  }
  isConfirming.value = true // opens the confirm overlay, doesn't save yet
}

async function confirmSave() {
  isConfirming.value = false
  try {
    await authStore.updateProfile({ username: draft.username.trim(), email: draft.email.trim() })
    isEditing.value = false
  } catch {
    // authStore.error is already set and shown in the template — stay
    // in edit mode so the person can fix the issue without retyping.
  }
}

// Closing the whole modal while mid-edit shouldn't silently discard an
// open confirm step — simplest safe behavior is just closing everything.
function handleClose() {
  isConfirming.value = false
  emit('close')
}

// Close on Escape key — small UX detail, easy to miss but expected of any modal.
function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (isConfirming.value) {
      isConfirming.value = false
    } else {
      handleClose()
    }
  }
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1.5rem;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 22rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(212, 162, 76, 0.25);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.9rem;
  background: none;
  border: none;
  color: #8b87a6;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.modal__close:hover {
  color: #f0e9da;
}

.modal__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #14131f;
  margin: 0 auto 1rem;
}

.modal__username {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  color: #f0e9da;
  margin-bottom: 1.5rem;
}

.modal__fields {
  text-align: left;
  margin-bottom: 1.5rem;
}

.modal__field {
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(139, 135, 166, 0.15);
}

.modal__field:last-child {
  border-bottom: none;
}

.modal__label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b87a6;
  margin-bottom: 0.2rem;
}

.modal__value {
  font-size: 0.9rem;
  color: #d8d4e8;
}

.modal__note {
  font-size: 0.75rem;
  color: #8b87a6;
  font-style: italic;
  margin-top: 1rem;
}

.modal__btn {
  padding: 0.6rem 1.25rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(139, 135, 166, 0.3);
  background: transparent;
  color: #b8b4cc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.modal__btn:hover {
  border-color: #d4a24c;
  color: #d4a24c;
}

.modal__btn--primary {
  background: #3fa796;
  border-color: #3fa796;
  color: #14131f;
  font-weight: 600;
}

.modal__btn--primary:hover {
  color: #14131f;
  opacity: 0.9;
}

.modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal__edit-title {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  color: #f0e9da;
  margin-bottom: 1.25rem;
}

.modal__edit-field {
  text-align: left;
  margin-bottom: 1rem;
}

.modal__input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 0.4rem;
  background: #14131f; /* ink-950 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  margin-top: 0.3rem;
}

.modal__input:focus {
  border-color: #3fa796;
}

.modal__error {
  font-size: 0.8rem;
  color: #c1432b;
  margin-bottom: 1rem;
  text-align: left;
}

.modal__edit-actions {
  display: flex;
  gap: 0.75rem;
}

.modal__edit-actions .modal__btn {
  flex: 1;
}

/* Confirm-before-save overlay — stacks on top of the modal itself */
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60; /* above .modal-backdrop's z-index: 50 */
  padding: 1.5rem;
}

.confirm-box {
  width: 100%;
  max-width: 20rem;
  background: #201f33;
  border: 1px solid rgba(212, 162, 76, 0.4);
  border-radius: 0.6rem;
  padding: 1.5rem;
  text-align: center;
}

.confirm-box__text {
  font-size: 0.9rem;
  color: #f0e9da;
  margin-bottom: 1.25rem;
}

.confirm-box__actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-box__actions .modal__btn {
  flex: 1;
}
</style>