<template>
  <RouterLink
    :to="`/script/${script.id}`"
    class="group block bg-gray-900/80 border border-white/8 rounded-2xl overflow-hidden hover:border-amber-500/50 active:scale-[0.97] transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
  >
    <!-- Cover -->
    <div class="relative aspect-[2/3] overflow-hidden">
      <img
        :src="script.cover"
        :alt="script.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- Gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

      <!-- Status badge -->
      <div class="absolute top-2.5 left-2.5 flex gap-1.5">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="script.status === '已完结' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-gray-900'"
        >{{ script.status }}</span>
        <span v-if="script.category === 'ai'" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/90 text-white">AI创作</span>
      </div>

      <!-- Episode count -->
      <div class="absolute bottom-2.5 right-2.5 text-xs text-gray-300 bg-black/60 px-2 py-0.5 rounded-full">
        共{{ script.totalEpisodes }}集
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <h3 class="text-white font-bold text-sm leading-tight mb-1.5 line-clamp-1">{{ script.title }}</h3>
      <p class="text-gray-400 text-xs line-clamp-1 mb-2.5">{{ script.subtitle }}</p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in script.tags.slice(0, 3)"
          :key="tag"
          class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20"
        >{{ tag }}</span>
      </div>

      <!-- Price row -->
      <div class="flex items-center justify-between">
        <span class="text-amber-400 font-bold text-sm">{{ script.price }}</span>
        <span class="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          {{ script.rights.includes('独家') ? '独家' : '版权' }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({ script: { type: Object, required: true } })
</script>
