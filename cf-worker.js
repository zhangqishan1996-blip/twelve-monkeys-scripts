/**
 * Cloudflare Worker — 反向代理 Railway 后端 API
 *
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. 粘贴此文件内容，点击 Deploy
 * 3. Worker 域名格式：https://twelve-monkeys-proxy.YOUR-NAME.workers.dev
 * 4. 在 Vercel 项目中将环境变量 VITE_API_URL 改为上面的 Worker 域名
 *
 * 说明：
 * - 前端调用 https://[worker域名]/api/xxx
 * - Worker 转发到 RAILWAY_ORIGIN/api/xxx
 * - 国内用户 → Cloudflare CDN（香港/台湾节点）→ Railway，绕过直连限制
 */

const RAILWAY_ORIGIN = 'https://twelve-monkeys-scripts-production.up.railway.app'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

export default {
  async fetch(request) {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // 只代理 /api/* 路径
    if (!url.pathname.startsWith('/api')) {
      return new Response('Not Found', { status: 404 })
    }

    const targetUrl = `${RAILWAY_ORIGIN}${url.pathname}${url.search}`

    const proxied = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    })

    try {
      const response = await fetch(proxied)
      const newHeaders = new Headers(response.headers)
      Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v))

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: '代理请求失败', detail: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }
  },
}
