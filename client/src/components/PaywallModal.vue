<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-end justify-center"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Sheet -->
        <div class="relative w-full max-w-md bg-gray-950 rounded-t-3xl border-t border-white/10 shadow-2xl fade-up pb-safe">
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          <div class="px-6 pb-8 pt-2">
            <!-- Lock icon with glow -->
            <div class="flex justify-center mb-4">
              <div class="relative">
                <div class="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
                <div class="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C8.676 1 6 3.676 6 7v1H4a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V9a1 1 0 00-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/>
                  </svg>
                </div>
              </div>
            </div>

            <h2 class="text-white text-xl font-bold text-center mb-1">{{ t('paywall.title') }}</h2>
            <p class="text-gray-400 text-sm text-center mb-5">{{ t('paywall.subtitle') }}</p>

            <!-- Episode info -->
            <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-xs uppercase tracking-wider mb-0.5">{{ t('player.episode', { num: episode?.episode_num }) }}</p>
                  <p class="text-white font-semibold">{{ episode?.title }}</p>
                </div>
                <div class="coin-badge text-gray-900 font-bold text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path fill="white" d="M12 6a1 1 0 00-1 1v1H9a1 1 0 000 2h2v1H9a1 1 0 000 2h2v1a1 1 0 002 0v-1h2a1 1 0 000-2h-2v-1h2a1 1 0 000-2h-2V7a1 1 0 00-1-1z"/>
                  </svg>
                  {{ t('paywall.cost', { coins: episode?.coin_cost || 10 }) }}
                </div>
              </div>
            </div>

            <!-- Balance -->
            <p class="text-center text-xs mb-4"
               :class="hasEnoughCoins ? 'text-gray-400' : 'text-red-400'">
              {{ hasEnoughCoins ? t('paywall.balance', { coins: userCoins }) : t('paywall.insufficient') }}
            </p>

            <!-- Primary action: Unlock with coins -->
            <button
              v-if="hasEnoughCoins"
              @click="$emit('unlock')"
              :disabled="loading"
              class="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold rounded-2xl text-base hover:opacity-90 active:scale-95 transition-all mb-3 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <svg v-if="!loading" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C8.676 1 6 3.676 6 7v1H4a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V9a1 1 0 00-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ t('paywall.unlock') }}
            </button>

            <!-- Recharge button -->
            <button
              @click="$emit('recharge')"
              class="w-full py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/15 active:scale-95 transition-all mb-3"
            >
              💎 {{ t('paywall.recharge') }}
            </button>

            <!-- Watch Ad -->
            <button
              @click="$emit('watchAd')"
              class="w-full py-3 text-gray-300 text-sm flex items-center justify-center gap-2 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {{ t('paywall.watchAd') }}
              <span class="text-gray-500 text-xs">· {{ t('paywall.adNote') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { authStore } from '../stores/auth'

const { t } = useI18n()
defineProps({
  show: Boolean,
  episode: Object,
  loading: Boolean,
})
defineEmits(['close', 'unlock', 'recharge', 'watchAd'])

const userCoins = computed(() => authStore.user?.coins_balance ?? 0)
const hasEnoughCoins = computed(() => {
  const cost = 10
  return authStore.isLoggedIn && userCoins.value >= cost
})
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { transform: translateY(100%); opacity: 0; }

.pb-safe {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}
</style>
