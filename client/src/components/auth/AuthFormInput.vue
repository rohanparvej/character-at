<!--
  AuthFormInput.vue
  -------------------
  A single labeled input, shared by SignupView and LoginView so the
  markup/styling for "label + input + error text" isn't duplicated
  in both forms. Uses v-model via defineModel (Vue 3.4+ shorthand).

  TEMPLATE NOTE: this generalizes to any form in the app later
  (character creation form, etc.) — not auth-specific despite the name.
  Feel free to rename to just FormInput.vue and move out of auth/ if
  you reuse it elsewhere.

  PASSWORD VISIBILITY TOGGLE:
  When `type="password"` is passed in, this component automatically
  shows a show/hide button — SignupView/LoginView don't need any extra
  markup or logic, they just keep passing type="password" like before.
  Uses a plain text glyph (no icon library) to stay dependency-free.
-->
<template>
  <div class="form-field">
    <label :for="id" class="form-field__label">{{ label }}</label>

    <!-- Wrapper needed so the toggle button can sit inside the input
         visually (position: absolute, anchored to this relative wrapper) -->
    <div class="form-field__input-wrapper">
      <input
        :id="id"
        v-model="model"
        :type="resolvedType"
        :placeholder="placeholder"
        class="form-field__input"
        :class="{ 'form-field__input--error': error, 'form-field__input--has-toggle': isPasswordField }"
      />

      <!-- Only rendered for password fields — text/email inputs don't get this button -->
      <button
        v-if="isPasswordField"
        type="button"
        class="form-field__toggle"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </button>
    </div>

    <p v-if="error" class="form-field__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// defineModel creates a two-way binding without manually wiring
// props + emit('update:modelValue') — parent just does v-model="username"
const model = defineModel({ type: String, default: '' })

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' }, // field-specific validation error, if any
})

const isPasswordField = computed(() => props.type === 'password')

// Local UI state — starts hidden every time, deliberately not persisted
// anywhere (no reason a password's visibility should survive a reload).
const showPassword = ref(false)

// Actual <input type="..."> value used in the template. Only differs
// from props.type when this is a password field and the user toggled it.
const resolvedType = computed(() => {
  if (isPasswordField.value) return showPassword.value ? 'text' : 'password'
  return props.type
})
</script>

<style scoped>
.form-field {
  margin-bottom: 1.25rem;
}

.form-field__label {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b87a6; /* ink-faint */
  margin-bottom: 0.4rem;
}

.form-field__input-wrapper {
  position: relative;
}

.form-field__input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 0.5rem;
  background: #14131f; /* ink-950 */
  border: 1px solid rgba(139, 135, 166, 0.3);
  color: #f0e9da; /* parchment */
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

/* Extra right padding so typed text never runs under the Show/Hide button */
.form-field__input--has-toggle {
  padding-right: 3.25rem;
}

.form-field__input:focus {
  border-color: #3fa796; /* signal-teal */
}

.form-field__input--error {
  border-color: #c1432b;
}

.form-field__toggle {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #8b87a6; /* ink-faint */
  padding: 0.25rem 0.4rem;
  transition: color 0.2s ease;
}

.form-field__toggle:hover {
  color: #3fa796; /* signal-teal */
}

.form-field__error {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #c1432b;
}
</style>