# syntax=docker/dockerfile:1

# ==================== 依赖安装 ====================
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ==================== 构建 ====================
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 构建期占位变量：镜像构建阶段连不上数据库时，
# 动态页面会自动回退为运行时按需生成（ISR），真实值在运行时注入
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-32-chars!!"
RUN pnpm build

# ==================== 运行 ====================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
