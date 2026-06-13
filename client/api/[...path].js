/**
 * Vercel Edge Function — catch-all API 代理
 *
 * 捕获所有 /api/* 请求，服务端转发到 Railway。
 * 用户浏览器 → Vercel Edge（无需代理）→ Railway（服务器间不受 GFW 限制）
 */

export const config = { runtime: 'edge' }

const RAILWAY = process.env.RAILWAY_URL ||
  'https://twelve-monkeys-scripts-production.up.railway.app'

export default async function handler(request) {
  const url = new URL(request.url)
  const targetUrl = `${RAILWAY}${url.pathname}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    })
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    })
  } catch {
    return new Response(JSON.stringify({ error: '上游服务暂时不可用' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
