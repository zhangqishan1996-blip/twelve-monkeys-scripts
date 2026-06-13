import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/script/:id', component: () => import('../views/ScriptDetailView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  { path: '/shop', component: () => import('../views/ShopView.vue'), meta: { requiresAuth: true } },
  { path: '/payment/success', component: () => import('../views/PaymentSuccessView.vue') },
  { path: '/payment/cancel', component: () => import('../views/PaymentCancelView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }
})

export default router
