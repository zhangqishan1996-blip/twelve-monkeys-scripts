<template>
  <div class="min-h-dvh bg-gray-950 flex flex-col items-center justify-center p-6">
    <!-- Logo -->
    <div class="mb-8 text-center">
      <div class="text-4xl mb-2">🎬</div>
      <h1 class="text-white text-2xl font-bold tracking-tight">{{ t('app.title') }}</h1>
    </div>

    <div class="w-full max-w-sm bg-gray-900 rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h2 class="text-white text-xl font-bold mb-6">{{ t('auth.loginTitle') }}</h2>

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
            autocomplete="current-password"
            class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition-colors placeholder-gray-600"
            placeholder="••••••••"
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
          {{ t('auth.loginBtn') }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-400 mt-5">
        <RouterLink to="/register" class="text-amber-400 hover:text-amber-300 transition-colors">
          {{ t('auth.switchToRegister') }}
        </RouterLink>
      </p>
    </div>

    <div class="mt-4">
      <LanguagePicker />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { authStore } from '../stores/auth'
import LanguagePicker from '../components/LanguagePicker.vue'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post('/auth/login', form)
    authStore.login(data.token, data.user)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
