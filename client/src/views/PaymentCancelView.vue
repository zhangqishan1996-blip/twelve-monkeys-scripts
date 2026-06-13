<template>
  <div class="min-h-dvh bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
    <div class="text-6xl mb-4">😔</div>
    <h1 class="text-white text-2xl font-bold mb-2">{{ t('payment.cancel') }}</h1>
    <p class="text-gray-400 mb-8 max-w-xs">{{ t('payment.cancelMsg') }}</p>
    <div class="flex gap-3">
      <RouterLink
        to="/shop"
        class="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
      >
        Try Again
      </RouterLink>
      <RouterLink
        to="/"
        class="bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
      >
        {{ t('payment.backHome') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
