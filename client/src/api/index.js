import axios from 'axios'

// Dev: Vite proxy forwards /api → localhost:3000
// Production: Vercel Edge Function at /api/[...path].js proxies to Railway
// 无需 VITE_API_URL — 与前端同域，国内用户无需代理即可访问
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      err.userMessage = '请求超时，请检查网络环境或尝试使用代理服务'
    } else if (!err.response) {
      err.userMessage = '无法连接到服务器，请检查网络后重试'
    }
    return Promise.reject(err)
  }
)

export default api
