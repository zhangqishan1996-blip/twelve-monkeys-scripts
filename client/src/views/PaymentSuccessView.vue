<template>
  <div class="min-h-dvh bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
    <div class="text-6xl mb-4 animate-bounce">🎉</div>
    <h1 class="text-white text-2xl font-bold mb-2">{{ t('payment.success') }}</h1>
    <p class="text-gray-400 mb-8 max-w-xs">{{ t('payment.successMsg') }}</p>
    <RouterLink
      to="/"
      class="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
    >
      {{ t('payment.backHome') }}
    </RouterLink>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { authStore } from '../stores/auth'

const { t } = useI18n()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    try {
      const { data } = await api.get('/payments/balance')
      authStore.updateCoins(data.coins_balance)
    } catch {}
  }
})
</script>
