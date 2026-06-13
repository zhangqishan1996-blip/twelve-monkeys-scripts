<template>
  <div class="relative">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all"
    >
      <span>{{ currentFlag }}</span>
      <span class="hidden sm:inline">{{ currentLabel }}</span>
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-44 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="select(lang.code)"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
          :class="{ 'bg-white/10': locale === lang.code }"
        >
          <span class="text-lg">{{ lang.flag }}</span>
          <span>{{ lang.label }}</span>
          <span v-if="locale === lang.code" class="ml-auto text-amber-400">✓</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const open = ref(false)

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
]

const currentFlag = computed(() => languages.find(l => l.code === locale.value)?.flag || '🌐')
const currentLabel = computed(() => languages.find(l => l.code === locale.value)?.label || 'EN')

function select(code) {
  locale.value = code
  localStorage.setItem('locale', code)
  open.value = false
}

function handleOutside(e) {
  if (!e.target.closest('.relative')) open.value = false
}

onMounted(() => document.addEventListener('click', handleOutside))
onUnmounted(() => document.removeEventListener('click', handleOutside))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
