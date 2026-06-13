# 十二猴子剧本 · 生产部署指南

## 打包产物清单

| 目录 | 内容 | 大小 |
|------|------|------|
| `client/dist/` | 前端静态文件（已打包压缩） | ~388 KB（Gzip ~130 KB） |
| `server/src/` | Node.js 后端源码 | — |
| `Dockerfile` | 单镜像（前端 + 后端） | — |
| `docker-compose.prod.yml` | 含 PostgreSQL + Nginx | — |

---

## 方案一：最快上线（推荐 · 国际用户）

### 前端 → Vercel（免费，5 分钟完成）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在 client/ 目录下
cd client
vercel --prod
```

Vercel 会自动识别 Vite 项目并完成 CDN 部署。
部署后记录 Vercel 给出的域名，例如 `https://twelve-monkeys.vercel.app`。

**注意**：Vercel 部署前端时，API 请求需要指向后端真实域名。
在 `client/src/api/index.js` 中将 `baseURL` 改为：
```js
const api = axios.create({ baseURL: 'https://your-backend.railway.app/api' })
```

---

### 后端 + 数据库 → Railway（免费额度，10 分钟完成）

1. 访问 [railway.app](https://railway.app) 并登录
2. New Project → Deploy from GitHub → 选择本仓库
3. Add Plugin → PostgreSQL（Railway 自动注入 `DATABASE_URL`）
4. 在 Variables 面板填入以下环境变量（见下方配置表）
5. 设置 Start Command：`node server/src/index.js`
6. 设置 Root Directory：留空（Railway 会识别 Dockerfile）

部署完成后复制 Railway 给出的域名，填入 Vercel 的 `VITE_API_URL` 环境变量。

---

## 方案二：国内用户（腾讯云 / 阿里云）

### 架构

```
用户 → 腾讯云 CDN → 对象存储 COS（前端静态）
              ↓
         腾讯云 CVM（2核4G，约 ¥60/月）
              ↓
         PostgreSQL（腾讯云 TDSQL 或自建）
```

### 前端 → 腾讯云 COS + CDN

```bash
# 打包
cd client && npm run build

# 上传 dist/ 到 COS Bucket（开启静态网站托管）
# 在 CDN 控制台绑定自定义域名并申请免费 SSL 证书
```

### 后端 → CVM + PM2

```bash
# 在 CVM 上（Ubuntu 22.04 推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
npm install -g pm2

# 上传 server/ 目录，设置 .env
cd server
cp .env.production .env
# 编辑 .env 填入真实值

npm install --omit=dev
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # 设置开机自启
```

---

## 方案三：Docker 一键部署（任意 VPS）

```bash
# 克隆代码到服务器
git clone <your-repo>
cd short-drama-ai

# 配置生产环境变量
cp server/.env.production server/.env
# 编辑 server/.env，填入真实值

# 启动全套服务（Nginx + PostgreSQL + App）
POSTGRES_PASSWORD=你的强密码 docker compose -f docker-compose.prod.yml up -d

# 查看运行状态
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs app
```

---

## 生产 .env 完整配置表

编辑 `server/.env`，以下参数**全部必填**：

| 参数 | 说明 | 示例 |
|------|------|------|
| `NODE_ENV` | 运行模式 | `production` |
| `PORT` | 监听端口 | `3000` |
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host:5432/shortdrama` |
| `JWT_SECRET` | JWT 签名密钥（64位随机字符串） | `openssl rand -hex 32` 生成 |
| `CLIENT_URL` | 前端域名（CORS 白名单） | `https://yourapp.com` |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | 测试: `sk_test_xxx` / 生产: `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名 | `whsec_xxx`（Stripe 控制台获取） |

### Stripe 环境切换

```bash
# 测试环境（默认，使用测试卡 4242 4242 4242 4242）
STRIPE_SECRET_KEY=sk_test_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx

# 正式生产（接真实收款）
STRIPE_SECRET_KEY=sk_live_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
```

健康检查接口会实时反映配置状态：
```bash
curl https://your-api.com/api/health
# {"status":"ok","env":"production","stripe":true,"db":true}
```

---

## Stripe Webhook 配置（上线后必做）

1. 登录 Stripe Dashboard → Developers → Webhooks
2. Add endpoint：`https://your-api.com/api/payments/webhook`
3. 选择事件：`checkout.session.completed`
4. 复制 Signing secret（`whsec_xxx`）填入 `.env` 的 `STRIPE_WEBHOOK_SECRET`

---

## SSL 证书（HTTPS）

```bash
# 使用 Certbot 自动申请免费 Let's Encrypt 证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# 证书会自动续期
```

---

## 部署后验收清单

- [ ] `GET /api/health` 返回 `{"status":"ok","stripe":true,"db":true}`
- [ ] 首页正常加载，两个 Tab 切换正常
- [ ] 剧本详情页三个 Tab（大纲/剧本/视频）均可打开
- [ ] 水印在剧本预览页正确显示
- [ ] 注册/登录功能正常
- [ ] 联系抽屉「一键复制」功能正常
- [ ] Stripe 测试支付（用卡号 4242 4242 4242 4242）走通完整流程
- [ ] HTTPS 证书有效，HTTP 自动跳转 HTTPS

---

## 运维命令速查

```bash
# PM2
pm2 status                          # 查看进程状态
pm2 logs twelve-monkeys-api         # 实时日志
pm2 restart twelve-monkeys-api      # 重启
pm2 monit                           # 监控面板

# Docker
docker compose -f docker-compose.prod.yml logs -f app   # 实时日志
docker compose -f docker-compose.prod.yml restart app   # 重启应用
docker compose -f docker-compose.prod.yml pull && \
  docker compose -f docker-compose.prod.yml up -d       # 更新部署

# 数据库备份
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```
