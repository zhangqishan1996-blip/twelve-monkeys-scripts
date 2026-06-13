<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div
        v-if="visible"
        class="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-900/95 to-black/95 border-b border-amber-500/30 backdrop-blur-sm"
        style="padding-top: max(12px, env(safe-area-inset-top))"
      >
        <!-- 图标 -->
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-lg">
          🎬
        </div>

        <!-- 文字 -->
        <div class="flex-1 min-w-0">
          <p class="text-amber-300 text-xs font-semibold leading-tight">添加到主屏幕，获得 App 体验</p>
          <p class="text-gray-400 text-[10px] leading-tight mt-0.5">
            <template v-if="isIOS">点击底栏 <span class="text-amber-400">分享</span> → 添加到主屏幕</template>
            <template v-else>点击右侧按钮一键安装</template>
          </p>
        </div>

        <!-- 操作按钮 -->
        <button
          v-if="!isIOS && canInstall"
          @click="install"
          class="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          安装
        </button>

        <!-- 关闭 -->
        <button
          @click="dismiss"
          class="flex-shrink-0 text-gray-500 hover:text-gray-300 text-lg leading-none pl-1"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const DISMISS_KEY = 'pwa_prompt_dismissed'

const visible = ref(false)
const isIOS = ref(false)
const canInstall = ref(false)
let deferredPrompt = null

function dismiss() {
  visible.value = false
  localStorage.setItem(DISMISS_KEY, Date.now().toString())
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  if (outcome === 'accepted') visible.value = false
}

onMounted(() => {
  // 已安装或已关闭超过7天内不再显示
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (dismissed && Date.now() - Number(dismissed) < 7 * 86400 * 1000) return

  // 已在 standalone 模式（已安装）不显示
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (window.navigator.standalone === true) return

  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua)
  if (!isMobile) return

  isIOS.value = /iPhone|iPad|iPod/i.test(ua)

  if (isIOS.value) {
    // iOS Safari 无 beforeinstallprompt，直接显示操作指引
    visible.value = true
    return
  }

  // Android Chrome
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    canInstall.value = true
    visible.value = true
  })
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
