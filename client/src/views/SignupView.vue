<!--
  SignupView.vue
  ----------------
  Signup page. Handles its own frontend validation (fast feedback,
  no network round-trip needed for obvious mistakes) but the backend
  re-validates everything too — never trust the frontend as the only gate.
-->
<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1 class="auth-card__title">Create your account</h1>
      <p class="auth-card__subtitle">
        Only needed for social features — trading cards, friend requests, ratings.
      </p>

      <form @submit.prevent="handleSubmit">
        <AuthFormInput
          id="username"
          v-model="form.username"
          label="Username"
          placeholder="marlowe_writes"
          :error="fieldErrors.username"
        />
        <AuthFormInput
          id="email"
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          :error="fieldErrors.email"
        />
        <AuthFormInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          :error="fieldErrors.password"
        />
        <AuthFormInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          label="Confirm password"
          :error="fieldErrors.confirmPassword"
        />

        <!-- Server-side error (e.g. "username already taken") shows here,
             separate from per-field errors above which are client-side only -->
        <p v-if="authStore.error" class="auth-card__server-error">{{ authStore.error }}</p>

        <button type="submit" class="auth-card__submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Creating account…' : 'Sign Up' }}
        </button>
      </form>

      <p class="auth-card__switch">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthFormInput from '../components/auth/AuthFormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Per-field client-side errors — separate object from authStore.error,
// which is reserved for the server's response (e.g. "already taken").
const fieldErrors = ref({})

// Basic client-side validation, mirrors (but doesn't replace) the
// backend's utils/validators.js checks. Returns true if valid.
function validateForm() {
  const errors = {}

  if (form.username.length < 3) errors.username = 'Username must be at least 3 characters.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    await authStore.signup({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    // TODO (once dashboard + IndexedDB guest-check exist): check for
    // guest character data here and prompt import, per our agreed flow,
    // before redirecting.
    router.push('/dashboard')
  } catch {
    // authStore.error is already set and displayed in the template —
    // nothing else to do here, just prevent an unhandled rejection.
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #14131f; /* ink-950 */
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 24rem;
  background: #201f33; /* ink-800 */
  border: 1px solid rgba(212, 162, 76, 0.2);
  border-radius: 0.75rem;
  padding: 2rem;
}

.auth-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem;
  color: #f0e9da;
  margin-bottom: 0.4rem;
}

.auth-card__subtitle {
  font-size: 0.85rem;
  color: #8b87a6;
  margin-bottom: 1.5rem;
}

.auth-card__submit {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #3fa796;
  color: #14131f;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.auth-card__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-card__server-error {
  font-size: 0.85rem;
  color: #c1432b;
  margin-bottom: 1rem;
}

.auth-card__switch {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #8b87a6;
  text-align: center;
}

.auth-card__switch a {
  color: #d4a24c;
}
</style>