<template>
  <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
       :class="transparent ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-gray-950/95 backdrop-blur-md border-b border-white/6'">
    <!-- Logo -->
    <RouterLink to="/" class="flex items-center gap-2 group">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_18px_rgba(245,158,11,0.7)] transition-all">
        <span class="text-gray-900 font-black text-sm">12</span>
      </div>
      <span class="text-white font-bold text-base tracking-tight hidden sm:block">十二猴子<span class="text-amber-400">剧本</span></span>
    </RouterLink>

    <!-- Right controls -->
    <div class="flex items-center gap-2">
      <LanguagePicker />

      <div v-if="authStore.isLoggedIn" class="flex items-center gap-1.5">
        <RouterLink
          to="/shop"
          class="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all"
        >
          🪙 {{ authStore.user?.coins_balance ?? 0 }}
        </RouterLink>
        <button @click="logout" class="text-gray-400 text-sm px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all">
          退出
        </button>
      </div>
      <div v-else class="flex items-center gap-1.5">
        <RouterLink to="/login" class="text-gray-300 text-sm px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all">
          登录
        </RouterLink>
        <RouterLink to="/register" class="bg-amber-500 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full hover:bg-amber-400 transition-all">
          注册
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'
import LanguagePicker from './LanguagePicker.vue'

defineProps({ transparent: { type: Boolean, default: false } })

const router = useRouter()
function logout() {
  authStore.logout()
  router.push('/')
}
</script>
