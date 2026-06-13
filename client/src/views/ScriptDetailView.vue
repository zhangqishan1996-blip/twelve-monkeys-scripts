<template>
  <div class="min-h-dvh bg-[#0a0a0a] text-white pb-28">
    <NavBar :transparent="false" />

    <!-- Not found -->
    <div v-if="!script" class="flex flex-col items-center justify-center min-h-dvh gap-4 text-gray-500">
      <div class="text-5xl">🔍</div>
      <p>剧本不存在</p>
      <RouterLink to="/" class="text-amber-400 text-sm">返回首页</RouterLink>
    </div>

    <template v-else>
      <!-- ── Hero ───────────────────────────────────────────── -->
      <div class="relative h-64 sm:h-80 mt-14 overflow-hidden">
        <img :src="script.cover" class="w-full h-full object-cover scale-105" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-transparent to-transparent" />

        <div class="absolute bottom-5 left-4 right-4">
          <!-- Category badge -->
          <div class="flex gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="script.category === 'ai' ? 'bg-violet-600/90 text-white' : 'bg-amber-500/90 text-gray-900'">
              {{ script.category === 'ai' ? '🤖 AI创作' : '🎭 真人剧本' }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="script.status === '已完结' ? 'bg-emerald-500/90 text-white' : 'bg-blue-500/90 text-white'">
              {{ script.status }}
            </span>
          </div>

          <h1 class="text-white text-2xl font-black tracking-tight leading-tight mb-1">{{ script.title }}</h1>
          <p class="text-gray-300 text-sm">{{ script.subtitle }}</p>

          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <span v-for="tag in script.tags" :key="tag"
                  class="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Quick info bar ─────────────────────────────────── -->
      <div class="grid grid-cols-3 gap-px bg-white/6 mx-4 rounded-2xl overflow-hidden my-4">
        <div v-for="info in infoBar" :key="info.label" class="bg-gray-950 py-3.5 text-center">
          <div class="text-amber-400 font-bold text-sm">{{ info.value }}</div>
          <div class="text-gray-500 text-[10px] mt-0.5">{{ info.label }}</div>
        </div>
      </div>

      <!-- ── Tab nav ─────────────────────────────────────────── -->
      <div class="sticky top-14 z-30 bg-gray-950/95 backdrop-blur-md border-b border-white/6 mx-0">
        <div class="flex">
          <button
            v-for="tab in detailTabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-1 py-3.5 text-xs font-semibold relative transition-colors"
            :class="activeTab === tab.key ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'"
          >
            <span class="mr-1">{{ tab.icon }}</span>{{ tab.label }}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 transition-all duration-300"
                 :class="activeTab === tab.key ? 'opacity-100' : 'opacity-0'" />
          </button>
        </div>
      </div>

      <!-- ── Tab Content ─────────────────────────────────────── -->
      <div class="px-4 pt-5">

        <!-- ① 故事大纲 ─────────────────────────────────────── -->
        <div v-if="activeTab === 'synopsis'" class="space-y-5 fade-up">
          <!-- Background -->
          <section class="bg-gray-900/60 border border-white/8 rounded-2xl p-5">
            <h3 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-amber-400 rounded-full inline-block" />故事背景
            </h3>
            <p class="text-gray-300 text-sm leading-7">{{ script.synopsis.background }}</p>
          </section>

          <section class="bg-gray-900/60 border border-white/8 rounded-2xl p-5">
            <h3 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-amber-400 rounded-full inline-block" />核心剧情
            </h3>
            <p class="text-gray-300 text-sm leading-7">{{ script.synopsis.rebirth }}</p>
          </section>

          <section class="bg-gray-900/60 border border-white/8 rounded-2xl p-5">
            <h3 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-amber-400 rounded-full inline-block" />创作说明
            </h3>
            <p class="text-gray-300 text-sm leading-7">{{ script.synopsis.theme }}</p>
          </section>

          <!-- Characters -->
          <section>
            <h3 class="text-white font-bold mb-3 flex items-center gap-2">
              <span class="text-amber-400">👥</span> 人物设定
            </h3>
            <div class="space-y-3">
              <div
                v-for="char in script.characters"
                :key="char.name"
                class="bg-gray-900/60 border border-white/8 rounded-xl p-4 flex gap-3"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <span class="text-amber-400 font-black text-sm">{{ char.name[0] }}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-white font-bold text-sm">{{ char.name }}</span>
                    <span class="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">{{ char.role }}</span>
                  </div>
                  <p class="text-gray-400 text-xs leading-5">{{ char.desc }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- ② 剧本预览 ─────────────────────────────────────── -->
        <div v-else-if="activeTab === 'script'" class="fade-up">
          <!-- Episode picker -->
          <div class="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              v-for="ep in availableEpisodes"
              :key="ep.num"
              @click="selectedEp = ep.num"
              class="flex-shrink-0 h-9 px-3.5 rounded-xl text-xs font-semibold transition-all"
              :class="selectedEp === ep.num
                ? 'bg-amber-500 text-gray-900 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-gray-900 text-gray-400 border border-white/8 hover:border-amber-500/40'"
            >
              第{{ ep.num }}集
            </button>
          </div>

          <!-- Episode title -->
          <div class="bg-gray-900/80 border border-amber-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <span class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
              {{ selectedEp }}
            </span>
            <div>
              <p class="text-gray-400 text-[10px]">第 {{ selectedEp }} 集</p>
              <p class="text-white font-semibold text-sm">{{ currentEpisode?.title }}</p>
            </div>
          </div>

          <!-- Watermarked content -->
          <div class="bg-gray-900/50 border border-white/6 rounded-2xl overflow-hidden">
            <!-- Header bar -->
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-white/6 bg-black/30">
              <span class="text-gray-500 text-[10px]">十二猴子剧本 · 特约预览版本</span>
              <span class="text-red-400/60 text-[10px]">🔒 版权保护</span>
            </div>
            <WatermarkedScript v-if="currentEpisode" :content="currentEpisode.content" />
            <div v-else class="p-8 text-center text-gray-600 text-sm">
              暂无此集内容预览
            </div>
          </div>

          <!-- Upgrade hint -->
          <div class="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
            <p class="text-amber-400/80 text-xs">
              📖 本剧共 {{ script.totalEpisodes }} 集 · 此处提供前 {{ availableEpisodes.length }} 集预览<br/>
              <span class="text-gray-500">购买完整版权后可获得全部剧本源文件</span>
            </p>
          </div>
        </div>

        <!-- ③ 视频样片 ─────────────────────────────────────── -->
        <div v-else-if="activeTab === 'video'" class="fade-up space-y-4">
          <div class="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden">
            <!-- Video player -->
            <div class="relative bg-black aspect-video">
              <video
                v-if="!videoError && script.videoUrl"
                ref="videoEl"
                :src="script.videoUrl"
                class="w-full h-full object-cover"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                @contextmenu.prevent
                @error="videoError = true"
                playsinline
                preload="metadata"
              />
              <!-- 视频无法加载时的占位 -->
              <div v-else class="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <div class="text-4xl">🎬</div>
                <p class="text-amber-400 text-sm font-semibold">视频样片暂不可播放</p>
                <p class="text-gray-500 text-xs leading-5">
                  演示视频托管于海外服务器，国内网络可能无法加载。<br/>
                  正式签约后将提供国内高速播放链接。
                </p>
              </div>
              <!-- Sample label -->
              <div v-if="!videoError && script.videoUrl" class="absolute top-3 left-3 bg-black/70 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none">
                第1集 · 成品样片
              </div>
            </div>

            <div class="p-4">
              <h4 class="text-white font-semibold text-sm mb-1">{{ script.title }} · 第一集样片</h4>
              <p class="text-gray-500 text-xs leading-5">
                此视频为正式拍摄成品片段，用于展示剧本的影像呈现效果。
                完整集数视频及剧本文件，将在签约后提供。
              </p>
            </div>
          </div>

          <!-- Note -->
          <div class="bg-gray-900/40 border border-white/6 rounded-xl p-4">
            <p class="text-gray-500 text-xs leading-6">
              ⚠️ 视频内容受版权保护，禁止录屏、截取或二次传播。<br/>
              如需观看更多样片，请联系我们的商务团队。
            </p>
          </div>
        </div>

      </div>
    </template>

    <!-- ── Fixed bottom: Investment CTA ──────────────────────── -->
    <div class="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pb-safe">
      <div class="max-w-lg mx-auto flex gap-3">
        <button
          @click="contactOpen = true"
          class="flex-1 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-black text-base rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.6)] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          <span>💰</span>
          <span>投资购买 · 洽谈版权</span>
        </button>
        <button
          @click="contactOpen = true"
          class="w-14 py-4 bg-gray-900 border border-amber-500/30 text-amber-400 rounded-2xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Contact Drawer -->
    <ContactDrawer
      :show="contactOpen"
      @close="contactOpen = false"
      @pay="handlePay"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import WatermarkedScript from '../components/WatermarkedScript.vue'
import ContactDrawer from '../components/ContactDrawer.vue'
import { getScriptById } from '../data/scripts'
import { useRouter } from 'vue-router'
import api from '../api'
import { authStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()

const script = ref(getScriptById(route.params.id))
const activeTab = ref('synopsis')
const selectedEp = ref(1)
const contactOpen = ref(false)
const videoEl = ref(null)
const videoError = ref(false)

const detailTabs = [
  { key: 'synopsis', icon: '📖', label: '故事大纲' },
  { key: 'script',   icon: '📄', label: '剧本预览' },
  { key: 'video',    icon: '🎬', label: '视频样片' },
]

const infoBar = computed(() => script.value ? [
  { value: script.value.price, label: '版权价格' },
  { value: `${script.value.totalEpisodes}集`, label: '总集数' },
  { value: script.value.status, label: '完成状态' },
] : [])

const availableEpisodes = computed(() =>
  script.value?.episodes.slice(0, 10) ?? []
)

const currentEpisode = computed(() =>
  script.value?.episodes.find(e => e.num === selectedEp.value)
)

async function handlePay(item) {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const { data } = await api.post('/payments/checkout', { packageId: item.packageId || 'coins_1000' })
    window.location.href = data.url
  } catch (err) {
    alert(err.response?.data?.error || '支付跳转失败，请联系客服')
  }
}
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.pb-safe { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
</style>
