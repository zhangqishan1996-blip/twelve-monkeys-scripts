<template>
  <Teleport to="body">
    <!-- 微信内访问：全屏遮罩引导去外部浏览器打开 -->
    <Transition name="fade">
      <div
        v-if="isWeChat && wechatOverlayVisible"
        class="fixed inset-0 z-[999] bg-black/85"
        @click="wechatOverlayVisible = false"
      >
        <!-- 右上角箭头指引 -->
        <div class="absolute top-0 right-0 flex flex-col items-end pr-4 pt-2">
          <!-- 弯曲箭头 SVG -->
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="text-amber-400">
            <path
              d="M70 10 C70 10 50 8 30 20 C15 30 10 50 12 68"
              stroke="currentColor" stroke-width="3" stroke-linecap="round"
              fill="none" stroke-dasharray="6 4"
            />
            <polygon points="8,75 16,60 20,72" fill="currentColor" />
          </svg>
        </div>

        <!-- 说明文字 -->
        <div class="absolute top-24 right-4 left-8 text-right">
          <p class="text-white text-lg font-bold leading-relaxed">
            点击右上角 <span class="text-amber-400">···</span>
          </p>
          <p class="text-amber-300 text-base font-semibold mt-1">
            选择「在浏览器中打开」
          </p>
          <p class="text-gray-400 text-sm mt-3 leading-relaxed">
            在系统浏览器中打开后，<br/>即可将本站添加到手机桌面
          </p>
        </div>

        <!-- 底部关闭提示 -->
        <div class="absolute bottom-12 left-0 right-0 flex justify-center">
          <span class="text-gray-500 text-xs">点击任意区域关闭此提示</span>
        </div>
      </div>
    </Transition>

    <!-- 微信内：顶部横幅（引导去外部浏览器，不是安装提示） -->
    <Transition name="slide-down">
      <div
        v-if="isWeChat && !wechatOverlayVisible && wechatBannerVisible"
        class="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-900/95 to-black/95 border-b border-green-500/30 backdrop-blur-sm cursor-pointer"
        style="padding-top: max(12px, env(safe-area-inset-top))"
        @click="wechatOverlayVisible = true"
      >
        <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 text-base">
          📱
        </div>
        <div class="flex-1">
          <p class="text-green-300 text-xs font-semibold">在浏览器中打开，体验更流畅</p>
          <p class="text-gray-400 text-[10px]">点此查看操作步骤</p>
        </div>
        <button @click.stop="wechatBannerVisible = false" class="text-gray-600 hover:text-gray-400 text-lg pl-1">×</button>
      </div>
    </Transition>

    <!-- 非微信：PWA 安装引导横幅 -->
    <Transition name="slide-down">
      <div
        v-if="!isWeChat && visible"
        class="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-900/95 to-black/95 border-b border-amber-500/30 backdrop-blur-sm"
        style="padding-top: max(12px, env(safe-area-inset-top))"
      >
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-lg">
          🎬
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-amber-300 text-xs font-semibold leading-tight">添加到主屏幕，获得 App 体验</p>
          <p class="text-gray-400 text-[10px] leading-tight mt-0.5">
            <template v-if="isIOS">点击底栏 <span class="text-amber-400">分享</span> → 添加到主屏幕</template>
            <template v-else>点击右侧按钮一键安装</template>
          </p>
        </div>

        <button
          v-if="!isIOS && canInstall"
          @click="install"
          class="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          安装
        </button>

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
const isWeChat = ref(false)
const canInstall = ref(false)
const wechatOverlayVisible = ref(false)
const wechatBannerVisible = ref(false)
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
  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua)
  if (!isMobile) return

  // 微信内置浏览器检测
  if (/MicroMessenger/i.test(ua)) {
    isWeChat.value = true
    const wxDismissed = localStorage.getItem('wechat_banner_dismissed')
    if (!wxDismissed || Date.now() - Number(wxDismissed) > 3 * 86400 * 1000) {
      wechatBannerVisible.value = true
    }
    return
  }

  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (dismissed && Date.now() - Number(dismissed) < 7 * 86400 * 1000) return
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (window.navigator.standalone === true) return

  isIOS.value = /iPhone|iPad|iPod/i.test(ua)

  if (isIOS.value) {
    visible.value = true
    return
  }

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
