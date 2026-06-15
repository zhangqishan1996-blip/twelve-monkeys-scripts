<template>
  <div class="min-h-dvh bg-[#0a0a0a] text-white">
    <NavBar :transparent="false" />

    <!-- Hero banner（紧凑版） -->
    <div class="relative pt-14 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-900 to-[#0a0a0a]" />
      <div class="absolute inset-0 opacity-20"
           style="background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(245,158,11,0.2), transparent);" />

      <div class="relative px-4 pt-5 pb-4 max-w-2xl mx-auto">
        <!-- 标题行 + 统计并排 -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight">
              <span class="text-white">十二猴子</span><span class="text-amber-400">剧本</span>
            </h1>
            <p class="text-gray-500 text-xs mt-0.5">精选短剧版权 · 专业授权 · 法律保护</p>
          </div>
          <!-- Stats inline -->
          <div class="flex gap-4 text-center">
            <div v-for="stat in stats" :key="stat.label">
              <div class="text-amber-400 font-black text-base">{{ stat.value }}</div>
              <div class="text-gray-600 text-[10px]">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab selector -->
    <div class="sticky top-14 z-40 bg-gray-950/95 backdrop-blur-md border-b border-white/6">
      <div class="flex max-w-2xl mx-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 py-4 flex flex-col items-center gap-1 relative transition-all"
          :class="activeTab === tab.key ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'"
        >
          <span class="text-lg">{{ tab.icon }}</span>
          <span class="text-xs font-semibold">{{ tab.label }}</span>
          <span class="text-[10px] text-gray-500">{{ tab.sub }}</span>

          <!-- Active indicator -->
          <div
            class="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-amber-400 transition-all duration-300"
            :class="activeTab === tab.key ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Script grid -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Section header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-white font-bold text-lg">{{ activeTabData.label }}</h2>
          <p class="text-gray-500 text-xs mt-0.5">{{ activeTabData.desc }}</p>
        </div>
        <span class="text-amber-400/60 text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          {{ activeScripts.length }} 部
        </span>
      </div>

      <!-- Card grid -->
      <div class="grid grid-cols-2 gap-4">
        <ScriptCard v-for="s in activeScripts" :key="s.id" :script="s" />
      </div>

      <!-- Empty state -->
      <div v-if="!activeScripts.length" class="text-center py-20 text-gray-600">
        <div class="text-5xl mb-3">📝</div>
        <p>暂无剧本</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t border-white/6 py-8 text-center text-gray-600 text-xs space-y-1 px-4">
      <p class="text-amber-500/60 font-semibold">十二猴子剧本工作室</p>
      <p>所有剧本版权受法律保护 · 未经授权禁止使用</p>
      <p>商务合作：invest@12monkeys.cn</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import ScriptCard from '../components/ScriptCard.vue'
import { getLiveScripts, getAIScripts } from '../data/scripts'

const activeTab = ref('live')

const tabs = [
  {
    key: 'live',
    icon: '🎭',
    label: '真人短剧剧本',
    sub: '实景拍摄 · 情感驱动',
    desc: '专业编剧团队原创，适合商业快节奏竖屏短剧',
  },
  {
    key: 'ai',
    icon: '🤖',
    label: 'AI真人短剧剧本',
    sub: 'AI辅助 · 科幻创新',
    desc: 'AI辅助构建世界观与技术逻辑，人类编剧精雕情感内核',
  },
]

const stats = [
  { value: '7+', label: '精选剧本' },
  { value: '480+', label: '集数产出' },
  { value: '100%', label: '版权保障' },
]

const liveScripts = getLiveScripts()
const aiScripts = getAIScripts()

const activeScripts = computed(() => activeTab.value === 'live' ? liveScripts : aiScripts)
const activeTabData = computed(() => tabs.find(t => t.key === activeTab.value))
</script>
