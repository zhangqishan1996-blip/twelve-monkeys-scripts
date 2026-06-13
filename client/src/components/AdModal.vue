<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90">
        <div class="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden shadow-2xl fade-up">

          <!-- Ad video area -->
          <div class="relative bg-black aspect-video flex items-center justify-center">
            <!-- 广告视频占位：正式上线时替换为阿里云 OSS / 腾讯云 COS 的视频链接 -->
            <div class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-900 to-black">
              <div class="text-5xl">📺</div>
              <p class="text-amber-400 text-sm font-semibold">广告加载中</p>
              <p class="text-gray-600 text-xs">请稍候，倒计时结束后可关闭</p>
            </div>

            <!-- Countdown overlay -->
            <div class="absolute top-3 right-3 flex items-center gap-2">
              <div class="relative w-10 h-10">
                <svg class="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" />
                  <circle
                    cx="22" cy="22" r="20"
                    fill="none"
                    stroke="#fbbf24"
                    stroke-width="3"
                    stroke-dasharray="126"
                    :stroke-dashoffset="126 - (126 * timeLeft / 30)"
                    class="transition-all duration-1000"
                  />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {{ timeLeft }}
                </span>
              </div>
            </div>

            <!-- Ad label -->
            <div class="absolute top-3 left-3 bg-black/60 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
              {{ t('ad.title') }}
            </div>
          </div>

          <!-- Bottom info -->
          <div class="p-5">
            <div v-if="timeLeft > 0" class="text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span class="text-white font-semibold">{{ t('ad.watching') }}</span>
              </div>
              <p class="text-gray-400 text-sm">{{ t('ad.skip', { sec: timeLeft }) }}</p>

              <!-- Progress bar -->
              <div class="mt-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000"
                  :style="{ width: `${((30 - timeLeft) / 30) * 100}%` }"
                />
              </div>
            </div>

            <div v-else class="text-center">
              <div class="text-2xl mb-2">🎉</div>
              <p class="text-green-400 font-semibold mb-4">{{ t('ad.complete') }}</p>
              <button
                @click="$emit('close')"
                class="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                {{ t('ad.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'complete'])

const timeLeft = ref(30)
let timer = null
const adVideo = ref(null)

watch(() => props.show, (val) => {
  if (val) {
    timeLeft.value = 30
    timer = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        clearInterval(timer)
        emit('complete')
      }
    }, 1000)
  } else {
    clearInterval(timer)
  }
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
