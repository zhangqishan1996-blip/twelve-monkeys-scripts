import { reactive } from 'vue'

export const authStore = reactive({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  get isLoggedIn() {
    return !!this.token
  },

  login(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  updateCoins(balance) {
    if (this.user) {
      this.user.coins_balance = balance
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  },
})
