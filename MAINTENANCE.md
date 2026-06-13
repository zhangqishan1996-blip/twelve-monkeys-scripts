# 十二猴子剧本 · 维护手册

## 架构一览

```
用户浏览器
  └─→ Vercel (前端 + Edge 代理)          client/
        └─→ Railway (Node.js 后端)        server/
              └─→ PostgreSQL (Railway 托管)
```

---

## 一、API 地址变更

后端迁移（Railway → 其他服务商）时，改两处：

| 位置 | 文件 | 改什么 |
|------|------|--------|
| Vercel 环境变量 | Vercel Dashboard → Settings → Env | `RAILWAY_URL` 改为新域名 |
| 代理兜底默认值 | `client/api/[...path].js` 第 4 行 | 改 `||` 后面的 fallback URL |

改完后 Vercel 自动重新部署，无需改前端代码。

---

## 二、新增页面

1. 在 `client/src/views/` 新建 `XxxView.vue`
2. 在 `client/src/router/index.js` 添加路由：
   ```js
   { path: '/xxx', component: () => import('../views/XxxView.vue') }
   ```
3. 在需要的地方用 `<RouterLink to="/xxx">` 链接过去

---

## 三、新增 API 接口（后端）

1. 在 `server/src/routes/` 新建或修改路由文件
2. 在 `server/src/index.js` 注册：
   ```js
   app.use('/api/xxx', require('./routes/xxx'))
   ```
3. 如涉及新数据库表，在 `server/src/db/migrate.js` 添加 `CREATE TABLE IF NOT EXISTS`

---

## 四、新增多语言文案

三个文件同步修改：
- `client/src/locales/en.json`
- `client/src/locales/es.json`
- `client/src/locales/zh-TW.json`

在 Vue 组件中用 `{{ $t('key') }}` 调用。

---

## 五、环境变量速查

### Vercel（前端 + 代理）
| 变量 | 说明 |
|------|------|
| `RAILWAY_URL` | Railway 后端完整域名，代理转发目标 |
| `VITE_API_URL` | 留空（走同域代理）；仅在完全自定义时填写 |

### Railway（后端）
| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串，Railway 自动注入 |
| `JWT_SECRET` | JWT 签名密钥，保持 64 位随机字符串 |
| `STRIPE_SECRET_KEY` | Stripe 密钥，`sk_live_` 前缀为正式环境 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 验签密钥 |
| `CLIENT_URL` | Vercel 前端域名，用于 CORS 白名单 |
| `NODE_ENV` | 固定填 `production` |

---

## 六、部署流程

```
本地改代码
  → git add / commit
  → git push origin main        ← 触发 Vercel 自动部署（前端）
                                 ← 触发 Railway 自动部署（后端，如已关联 GitHub）
```

手动重新部署：Vercel / Railway Dashboard → Deployments → Redeploy

---

## 七、API 慢请求监控

`client/src/api/index.js` 中的 axios 拦截器会在响应时间 > 3000ms 时自动打印：

```
[API SLOW] GET /api/episodes — 4231ms
```

在手机 Chrome 开发者工具或 PC 浏览器 Console 中可见，无需额外工具。
