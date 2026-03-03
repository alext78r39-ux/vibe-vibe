---
title: "Pset 3：认证与安全"
---

# Pset 3：认证与安全

> **类型**：Problem Set（规格驱动）
> **对应章节**：[第八章：安全与用户认证](../../Advanced/08-auth-security/)
> **预计耗时**：3-4 小时
> **交付物**：Better Auth 集成 + 受保护路由 + 数据隔离 + 限流 + 分享机制

Pset 2 中你构建了完整的 API 层，但目前所有端点都是"裸奔"状态——任何人都能调用，任何人都能看到所有数据。这个 Pset 要解决的就是：谁能访问什么，以及如何防止滥用。

## 前置要求

- 已完成 [Pset 2：API 与 AI 对话引擎](./06-api-with-ai.md)，所有 API 端点可正常工作
- 已阅读[第八章：安全与用户认证](../../Advanced/08-auth-security/)，理解认证与授权的区别
- GitHub OAuth App 已创建（用于第三方登录）

## 规格说明

### 1. Better Auth 集成

使用 Better Auth 实现认证系统，支持两种登录方式：

- 邮箱/密码注册登录（基础方式）
- GitHub OAuth（开发者群体的首选）

Better Auth 的优势在于它直接使用你已有的数据库（Pset 1 中的 `users`、`session`、`account` 表），不需要额外的认证服务：

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 2. 受保护路由中间件

创建训练会话、查看训练历史、生成报告——这些操作都需要登录。编写一个可复用的中间件函数，在 API Route 中统一校验身份：

```typescript
// lib/auth-guard.ts
import { auth } from "./auth";
import { headers } from "next/headers";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Response(
      JSON.stringify({ success: false, error: "请先登录" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return session.user;
}
```

在每个需要保护的 API Route 开头调用 `requireAuth()`。不要在中间件里做这件事——Next.js 的 Edge Middleware 不支持数据库连接，认证校验应该在 API Route 内部完成。

### 3. 数据隔离

这是安全层面最重要的规则：用户只能查看和操作自己的训练记录。每一条数据库查询都必须带上 `userId` 过滤条件：

```typescript
// 正确：始终过滤当前用户
const sessions = await db.query.trainingSessions.findMany({
  where: eq(trainingSessions.userId, currentUser.id),
  orderBy: desc(trainingSessions.createdAt),
});

// 错误：缺少 userId 过滤 = 数据泄露
const sessions = await db.query.trainingSessions.findMany({
  orderBy: desc(trainingSessions.createdAt),
});
```

对于 `GET /api/sessions/[id]` 这类单条查询，不能只用 `id` 查询——必须同时校验 `userId`。否则用户只要猜到别人的会话 ID 就能看到别人的对话内容，这是典型的 IDOR（不安全的直接对象引用）漏洞。

### 4. 限流策略

AI API 调用有成本，必须防止滥用。实现两层限流：

| 端点 | 限制 | 原因 |
|------|------|------|
| `POST /api/sessions/[id]/chat` | 10 次/分钟 | 每次调用消耗 AI token，防止脚本刷量 |
| `POST /api/sessions` | 5 次/小时 | 防止批量创建空会话占用数据库资源 |

限流可以用内存 Map 实现（单实例部署足够），key 为 `userId + endpoint`。触发限流时返回 HTTP 429 和明确的错误信息，告诉用户多久后可以重试。

### 5. 报告分享机制

训练报告需要支持公开分享，但要保护隐私：

- 生成报告时创建唯一的 `shareToken`（UUID v4）
- 公开链接 `/share/[token]` 无需登录即可访问
- 分享页面只展示：总分、各维度分析、强项/弱项、改进建议
- 不暴露完整对话内容——对话记录是用户的隐私数据

这个设计让用户可以把训练成绩分享到社交媒体或简历中，同时不泄露具体的对话过程。

### 6. 自定义场景权限

- 内置场景（`isBuiltin: true`）：所有用户可见
- 用户自定义场景：仅创建者可见（`WHERE creatorId = currentUser.id OR isBuiltin = true`）

:::warning 安全检查清单
在提交代码前，逐项确认：
- API 密钥是否全部在 `.env` 中，没有硬编码？
- 每个数据库查询是否都带了 `userId` 过滤？
- 错误响应是否泄露了内部信息（如数据库表名、堆栈跟踪）？
:::

## 里程碑

| # | 阶段 | 完成标志 |
|---|------|---------|
| 1 | Better Auth 配置 | 邮箱注册/登录 + GitHub OAuth 正常工作 |
| 2 | 受保护 API 中间件 | 未登录访问受保护端点返回 401 |
| 3 | 数据隔离 | 用户 A 无法通过 API 访问用户 B 的训练记录 |
| 4 | 限流实现 | 快速连续调用 chat 端点，第 11 次返回 429 |
| 5 | 分享链接 | 通过 shareToken 可在未登录状态下查看报告卡片 |

## 验收标准

- 注册、登录、GitHub OAuth 全流程正常
- 未登录状态下访问 `/api/sessions` 返回 `401`
- 用户 A 创建的训练会话，用户 B 通过 API 无法获取（即使知道会话 ID）
- 连续快速调用 chat 端点，超过 10 次/分钟后返回 `429 Too Many Requests`
- 分享链接在无 Cookie 的隐身窗口中可正常打开，显示报告卡片但无对话内容

## 下一步

认证和安全就绪后，进入 [Pset 4：API 测试](./08-api-testing.md)，确保所有端点的可靠性。
