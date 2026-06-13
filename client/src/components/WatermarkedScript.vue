<template>
  <div class="relative select-none" @contextmenu.prevent>
    <!-- Script content -->
    <div class="relative z-10 text-gray-200 text-sm leading-8 whitespace-pre-wrap font-mono tracking-wide p-1 pointer-events-none">{{ content }}</div>

    <!-- Dynamic watermark overlay -->
    <div class="absolute inset-0 z-20 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        class="absolute inset-0 w-full h-full opacity-[0.13]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="wm-pattern"
            x="0" y="0"
            width="220" height="120"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            <text
              x="10" y="40"
              font-family="PingFang SC, Noto Sans SC, sans-serif"
              font-size="13"
              fill="#FFD700"
              font-weight="600"
              letter-spacing="1"
            >十二猴子剧本</text>
            <text
              x="10" y="58"
              font-family="PingFang SC, Noto Sans SC, sans-serif"
              font-size="11"
              fill="#FFD700"
              font-weight="400"
              letter-spacing="0.5"
            >特约预览</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>

      <!-- Animated scan line -->
      <div
        class="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
        :style="{ top: scanPos + '%', transition: 'top 4s linear' }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ content: String })

const scanPos = ref(0)
let raf

function animateScan() {
  scanPos.value = (scanPos.value + 0.3) % 100
  raf = setTimeout(animateScan, 60)
}

onMounted(() => animateScan())
onUnmounted(() => clearTimeout(raf))
</script>
