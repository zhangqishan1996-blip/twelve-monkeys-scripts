<template>
  <div class="min-h-dvh bg-gray-950 text-white">
    <NavBar />
    <div class="pt-20 px-4 pb-10 max-w-lg mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">💎</div>
        <h1 class="text-2xl font-bold mb-1">{{ t('shop.title') }}</h1>
        <p class="text-gray-400 text-sm">{{ t('shop.subtitle') }}</p>
        <div class="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path fill="#000" d="M12 6a1 1 0 00-1 1v1H9a1 1 0 000 2h2v1H9a1 1 0 000 2h2v1a1 1 0 002 0v-1h2a1 1 0 000-2h-2v-1h2a1 1 0 000-2h-2V7a1 1 0 00-1-1z"/>
          </svg>
          {{ t('paywall.balance', { coins: authStore.user?.coins_balance ?? 0 }) }}
        </div>
      </div>

      <!-- Packages -->
      <div class="flex flex-col gap-4">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          @click="purchase(pkg)"
          class="relative bg-gray-900 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-amber-400/50 active:scale-[0.98] transition-all overflow-hidden"
          :class="{ 'border-amber-400': pkg.id === 'coins_1000', 'shadow-amber-500/20 shadow-lg': pkg.id === 'coins_1000' }"
        >
          <!-- Popular badge -->
          <div v-if="pkg.id === 'coins_1000'" class="absolute top-0 right-0 bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
            POPULAR
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-3xl">{{ pkg.emoji }}</div>
              <div>
                <p class="font-bold text-lg">{{ pkg.coins.toLocaleString() }} Coins</p>
                <p class="text-gray-400 text-sm">{{ pkg.description }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-amber-400">${{ (pkg.price / 100).toFixed(2) }}</p>
              <button
                class="mt-1 text-xs bg-amber-500 text-gray-900 font-bold px-3 py-1 rounded-full hover:bg-amber-400 transition-colors"
              >
                {{ processingId === pkg.id ? t('shop.processing') : t('shop.buy') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Security note -->
      <p class="text-center text-gray-600 text-xs mt-6 flex items-center justify-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
        Secured by Stripe · No card data stored
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { authStore } from '../stores/auth'
import NavBar from '../components/NavBar.vue'

const { t } = useI18n()
const processingId = ref(null)

const packages = ref([
  { id: 'coins_1000', coins: 1000, price: 999,  emoji: '🪙', description: 'Unlock ~100 episodes' },
  { id: 'coins_3000', coins: 3000, price: 2499, emoji: '💰', description: 'Best value · Save 17%' },
  { id: 'coins_6000', coins: 6000, price: 3999, emoji: '💎', description: 'Mega bundle · Save 33%' },
])

async function purchase(pkg) {
  if (processingId.value) return
  processingId.value = pkg.id
  try {
    const { data } = await api.post('/payments/checkout', { packageId: pkg.id })
    window.location.href = data.url
  } catch (err) {
    alert(err.response?.data?.error || 'Payment failed. Make sure STRIPE_SECRET_KEY is set.')
    processingId.value = null
  }
}
</script>
