<!--
  LoginView.vue
  ---------------
  Structurally mirrors SignupView.vue on purpose — same card layout,
  same AuthFormInput component, same submit/error pattern. Consistency
  here means a user who's seen one form immediately understands the other.
-->
<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1 class="auth-card__title">Welcome back</h1>
      <p class="auth-card__subtitle">Log in to access your friends and shared cards.</p>

      <form @submit.prevent="handleSubmit">
        <AuthFormInput
          id="emailOrUsername"
          v-model="form.emailOrUsername"
          label="Email or username"
          placeholder="you@example.com"
          :error="fieldErrors.emailOrUsername"
        />
        <AuthFormInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          :error="fieldErrors.password"
        />

        <p v-if="authStore.error" class="auth-card__server-error">{{ authStore.error }}</p>

        <button type="submit" class="auth-card__submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Logging in…' : 'Log In' }}
        </button>
      </form>

      <p class="auth-card__switch">
        New here?
        <router-link to="/signup">Create an account</router-link>
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
  emailOrUsername: '',
  password: '',
})

const fieldErrors = ref({})

function validateForm() {
  const errors = {}
  if (!form.emailOrUsername) errors.emailOrUsername = 'Email or username is required.'
  if (!form.password) errors.password = 'Password is required.'
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    await authStore.login(form)
    router.push('/dashboard')
  } catch {
    // authStore.error already holds the message; template displays it.
  }
}
</script>

<style scoped>
/* Identical to SignupView's styling — duplicated rather than shared
   via a mixin/parent class, since two small scoped <style> blocks are
   simpler to reason about than adding a CSS abstraction layer this early.
   If a third auth-style page appears later, consider extracting a
   shared .css file at that point. */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #14131f;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 24rem;
  background: #201f33;
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