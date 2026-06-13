import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.metadata = { startTime: Date.now() }
  return config
})

api.interceptors.response.use(
  res => {
    const ms = Date.now() - (res.config.metadata?.startTime ?? Date.now())
    if (ms > 3000) {
      console.warn(`[API SLOW] ${res.config.method?.toUpperCase()} ${res.config.url} — ${ms}ms`)
    }
    return res
  },
  err => {
    const ms = Date.now() - (err.config?.metadata?.startTime ?? Date.now())
    if (ms > 3000) {
      console.warn(`[API SLOW] ${err.config?.method?.toUpperCase()} ${err.config?.url} — ${ms}ms`)
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      err.userMessage = '请求超时，请检查网络环境或尝试使用代理服务'
    } else if (!err.response) {
      err.userMessage = '无法连接到服务器，请检查网络后重试'
    }
    return Promise.reject(err)
  }
)

export default api
