<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="show" class="fixed inset-0 z-[200] flex items-end justify-center" @click.self="$emit('close')">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Bottom Sheet -->
        <div class="relative w-full max-w-lg bg-gray-950 rounded-t-3xl border-t border-amber-500/30 shadow-2xl pb-safe">
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          <div class="px-5 pb-8 space-y-5">
            <!-- Header -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-xl">⚖️</div>
              <div>
                <h3 class="text-white font-bold text-lg">投资购买 · 洽谈版权</h3>
                <p class="text-amber-400 text-xs">十二猴子剧本 · 独家版权出售</p>
              </div>
            </div>

            <!-- Legal Notice -->
            <div class="bg-red-950/50 border border-red-500/30 rounded-xl p-4">
              <div class="flex items-start gap-2">
                <span class="text-red-400 text-lg mt-0.5">🔒</span>
                <div>
                  <p class="text-red-300 font-semibold text-xs mb-1">版权法律声明</p>
                  <p class="text-red-200/80 text-xs leading-5">
                    本平台所有剧本作品均依法在国家版权局完成登记，受《中华人民共和国著作权法》及相关国际版权公约保护。
                    任何未经授权的复制、传播、改编或商业使用行为，将依法承担民事及刑事责任。
                    版权所有 © 十二猴子剧本工作室，保留一切权利。
                  </p>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-3">
              <p class="text-gray-400 text-xs font-semibold uppercase tracking-wider">官方投资联系方式</p>

              <!-- WeChat -->
              <div class="flex items-center justify-between bg-gray-900 border border-white/8 rounded-xl px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-base">💬</div>
                  <div>
                    <p class="text-gray-400 text-[10px] mb-0.5">投资微信</p>
                    <p class="text-white font-semibold text-sm font-mono">TwelveMonkeys_IP</p>
                  </div>
                </div>
                <button
                  @click="copy('TwelveMonkeys_IP', 'wechat')"
                  class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  :class="copied.wechat ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'"
                >
                  <span>{{ copied.wechat ? '✓ 已复制' : '一键复制' }}</span>
                </button>
              </div>

              <!-- Email -->
              <div class="flex items-center justify-between bg-gray-900 border border-white/8 rounded-xl px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-base">📧</div>
                  <div>
                    <p class="text-gray-400 text-[10px] mb-0.5">商务邮箱</p>
                    <p class="text-white font-semibold text-sm font-mono">invest@12monkeys.cn</p>
                  </div>
                </div>
                <button
                  @click="copy('invest@12monkeys.cn', 'email')"
                  class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  :class="copied.email ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'"
                >
                  <span>{{ copied.email ? '✓ 已复制' : '一键复制' }}</span>
                </button>
              </div>
            </div>

            <!-- Stripe Deposit -->
            <div class="border-t border-white/8 pt-4 space-y-2">
              <p class="text-gray-400 text-xs">💳 在线支付意向定金（Stripe 安全支付）</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="item in depositOptions"
                  :key="item.amount"
                  @click="$emit('pay', item)"
                  class="flex flex-col items-center py-3 rounded-xl border text-center transition-all active:scale-95"
                  :class="selectedDeposit?.amount === item.amount
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-gray-900 text-gray-300 hover:border-amber-500/40'"
                >
                  <span class="font-bold text-sm">{{ item.label }}</span>
                  <span class="text-[10px] mt-0.5 opacity-60">定金</span>
                </button>
              </div>
              <button
                :disabled="!selectedDeposit"
                @click="$emit('pay', selectedDeposit)"
                class="w-full py-3.5 font-bold rounded-xl transition-all active:scale-95 text-sm"
                :class="selectedDeposit ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:opacity-90' : 'bg-gray-800 text-gray-600 cursor-not-allowed'"
              >
                {{ selectedDeposit ? `支付 ${selectedDeposit.label} 定金 →` : '请先选择定金金额' }}
              </button>
              <p class="text-gray-600 text-[10px] text-center">定金在正式签约后可抵扣版权费用 · 不签约全额退还</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toastMsg"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] bg-gray-900 border border-emerald-500/40 text-emerald-400 font-semibold text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
      >
        <span>✓</span><span>{{ toastMsg }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineProps({ show: Boolean })
defineEmits(['close', 'pay'])

const copied = reactive({ wechat: false, email: false })
const toastMsg = ref('')
const selectedDeposit = ref(null)

const depositOptions = [
  { amount: 1000, label: '¥1,000', packageId: 'deposit_1000' },
  { amount: 5000, label: '¥5,000', packageId: 'deposit_5000' },
  { amount: 10000, label: '¥10,000', packageId: 'deposit_10000' },
]

async function copy(text, key) {
  try {
    await navigator.clipboard.writeText(text)
    copied[key] = true
    showToast(`已复制：${text}`)
    setTimeout(() => { copied[key] = false }, 3000)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied[key] = true
    showToast(`已复制：${text}`)
    setTimeout(() => { copied[key] = false }, 3000)
  }
}

function showToast(msg) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}
</script>

<style scoped>
.sheet-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1); }
.sheet-leave-active { transition: all 0.25s ease; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%,-50%) scale(0.9); }

.pb-safe { padding-bottom: max(2rem, env(safe-area-inset-bottom)); }
</style>
