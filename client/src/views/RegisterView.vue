<template>
  <div class="min-h-dvh bg-gray-950 flex flex-col items-center justify-center p-6">
    <div class="mb-8 text-center">
      <div class="text-4xl mb-2">🎬</div>
      <h1 class="text-white text-2xl font-bold tracking-tight">{{ t('app.title') }}</h1>
    </div>

    <div class="w-full max-w-sm bg-gray-900 rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h2 class="text-white text-xl font-bold mb-1">{{ t('auth.registerTitle') }}</h2>
      <p class="text-amber-400 text-sm mb-6 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path fill="#000" d="M12 6a1 1 0 00-1 1v1H9a1 1 0 000 2h2v1H9a1 1 0 000 2h2v1a1 1 0 002 0v-1h2a1 1 0 000-2h-2v-1h2a1 1 0 000-2h-2V7a1 1 0 00-1-1z"/>
        </svg>
        {{ t('auth.newCoins') }}
      </p>

      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="text-gray-400 text-sm mb-1.5 block">{{ t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition-colors placeholder-gray-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="text-gray-400 text-sm mb-1.5 block">{{ t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
            class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition-colors placeholder-gray-600"
            placeholder="Min. 6 characters"
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ t('auth.registerBtn') }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-400 mt-5">
        <RouterLink to="/login" class="text-amber-400 hover:text-amber-300 transition-colors">
          {{ t('auth.switchToLogin') }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { authStore } from '../stores/auth'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post('/auth/register', form)
    authStore.login(data.token, data.user)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
