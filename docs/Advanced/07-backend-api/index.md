---
title: "第七章：后端API开发"
---

# 第七章：后端API开发

## 序言

界面有了，数据库也准备好了。你点击"提交"按钮，数据应该存入数据库——但前端和数据库之间还缺一座桥。

这座桥就是 **API（应用程序接口）**。前端通过 HTTP 请求告诉后端用户想要什么，后端处理后返回响应。

### 什么是后端

**后端**是运行在服务器上的代码，负责处理前端发来的请求、与数据库交互、执行业务逻辑。

| 层 | 职责 |
|----|------|
| **前端** | 展示界面、收集用户输入、发送 HTTP 请求 |
| **API** | 接收请求、验证参数、调用数据库、返回响应 |
| **数据库** | 存储和检索数据 |

前端不能直接访问数据库——那样会暴露所有数据，也无法做权限控制。API 是数据库的守门员，所有数据操作必须通过它。

### 什么是 API Route

**API Route** 是 Next.js 中定义 API 接口的方式。

#### 文件即路由

Next.js App Router 的设计是：**文件位置决定 URL 路径**。

```
app/api/posts/route.ts      →  GET/POST /api/posts
app/api/posts/[id]/route.ts →  GET/PUT/DELETE /api/posts/123
app/api/users/route.ts      →  GET/POST /api/users
```

你不需要写路由配置，不需要手动映射。创建文件就等于创建了接口。

#### Route Handler

在 `route.ts` 文件中，导出对应 HTTP 方法的函数：

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server'

// 获取列表
export async function GET() {
  return NextResponse.json({ posts: [] })
}

// 创建文章
export async function POST(request: Request) {
  const body = await request.json()
  // 处理创建逻辑...
  return NextResponse.json({ success: true })
}
```

Next.js 会根据请求方法自动调用对应的函数。如果导出了 `GET` 和 `POST`，同一个 URL 可以同时支持两种操作。

#### 动态路由参数

当路径中包含动态段（如 `[id]`），可以通过 `params` 获取：

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // 从 URL 中提取 id
  // 查询 id 对应的文章...
}
```

::: tip 版本变化快，让 AI 查文档

Next.js 版本迭代快，API 可能有变化。让 AI 用 Context7 查询最新文档，确保生成的代码符合当前版本。

提示词示例：
```
请用 Context7 查询 Next.js 16 关于 Route Handlers 和动态路由参数的最新文档，然后按照正确的方式生成代码。
```

:::

### 让 AI 生成后端代码

你把技术文档发给 AI："根据文档实现后端 API，使用 Drizzle ORM，连接 PostgreSQL 数据库。"

AI 生成了代码，你的工作是**审查**——确保代码能跑、健壮、安全。

### 你需要审查什么

AI 生成的代码通常能跑，但不一定健壮。审查时重点关注：

| 审查点 | 说明 |
|--------|------|
| **路径正确吗** | 文件位置是否对应预期的 URL |
| **参数获取方式对吗** | 动态路由用 `params`，查询参数用 `searchParams` |
| **有参数校验吗** | 用 Zod 验证输入，防止非法数据进入数据库 |
| **错误处理完整吗** | 数据库错误、网络错误、边界情况都要处理 |
| **没有暴露敏感数据吗** | 密码、token 等字段不能返回给前端 |
| **数据库操作安全吗** | 使用参数化查询，防止 SQL 注入 |

### 真正容易踩的坑

审查过程中，这些坑值得注意：

- **动态路由参数**：`params` 是 `Promise`，使用前必须 await
- **CORS 配置**：如果前端和后端不同域，需要正确配置 CORS 头
- **缓存策略**：Next.js 的 `fetch` 默认会缓存，可能导致数据过期
- **环境变量**：数据库连接字符串等敏感信息要放在 `.env.local`，不能提交到代码仓库
- **revalidatePath**：修改数据后要调用 `revalidatePath` 清除缓存，否则前端看不到更新
- **版本差异**：Next.js 版本更新快，旧教程的代码可能不适用

#### 让 AI 反复检查

Next.js 版本迭代快，AI 训练数据可能过时。让 AI 用 Context7 查询最新文档，反复验证：

```
请用 Context7 查询 Next.js 16 关于 Route Handlers 的最新文档，检查生成的代码是否符合当前版本规范。重点检查：params 的类型、函数签名、返回值格式。
```

### 你的工作

整个过程中你不需要手写每个接口。你只需要告诉 AI 需求，它会生成完整的代码。你的工作是**审查和验证**：

1. 代码能跑吗？——本地测试一下
2. 边界情况处理了吗？——空值、错误、超时
3. 安全吗？——参数校验、敏感数据过滤
4. 性能行吗？——N+1 查询、缓存策略

学会了这些，你就能放心地让 AI 帮你写后端了。

---

## 小节导航

```
- 7.1 API Route 基础 (./01-api-routes.md)
    Next.js App Router 的 API 路由结构、请求响应处理

- 7.2 RESTful API 设计 (./02-restful-design.md)
    RESTful 风格、路径设计、HTTP 方法使用

- 7.3 参数校验与错误处理 (./03-validation-errors.md)
    请求参数校验、Zod 验证、错误响应格式

- 7.4 数据库操作实战 (./04-database-crud.md)
    在 API Route 中调用 Drizzle ORM 实现完整 CRUD
```
