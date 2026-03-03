---
title: "Lab 5：为 API 写测试"
---

# Lab 5：为 API 写测试

> **面向人群**：完成 Pset 3 的开发者
> **项目周期**：约 1-2 小时
> **最终交付**：`pnpm test` 全绿，覆盖率 > 80%

## 前置要求

- 完成 Pset 3（API 与 AI 对话逻辑实现）
- 阅读 [进阶篇第 9 章：测试自动化](../../Advanced/09-testing-automation/)

---

## Step 1：配置 Vitest + 测试数据库

测试环境必须和开发环境隔离，否则测试数据会污染你的开发数据。

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react
```

创建独立的测试数据库配置：

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/talkcoach_test',
    },
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 80, branches: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

:::tip
用 Neon 的分支功能创建测试数据库，或者本地跑一个 PostgreSQL 容器。关键是测试数据库和开发数据库完全隔离。
:::

## Step 2：为场景 CRUD API 生成测试

让 AI 为场景相关的 API 生成测试：

```
请为以下 API 端点生成 Vitest 测试：
1. GET /api/scenarios — 获取所有场景列表
2. POST /api/scenarios — 创建新场景（管理员）
3. GET /api/scenarios/[id] — 获取场景详情

每个端点至少覆盖：正常响应、参数校验失败、未授权访问。
```

审查 AI 生成的测试时，确保它没有跳过数据库清理。每个测试用例结束后应该清理插入的数据，避免测试之间互相干扰。

## Step 3：为训练会话 API 生成测试

训练会话的测试更复杂，因为涉及状态流转：

```
请为训练会话 API 生成测试：
1. POST /api/sessions — 创建训练会话
2. GET /api/sessions — 获取用户的训练历史
3. GET /api/sessions/[id] — 获取会话详情（含消息列表）
4. PATCH /api/sessions/[id] — 更新会话状态

重点测试状态流转：preparing → in_progress → completed → reviewed
```

## Step 4：补充边界测试

AI 生成的测试通常只覆盖"正常路径"。你需要手动补充边界情况：

```
请补充以下边界测试：
1. 无效场景 ID（不存在的 UUID）→ 期望 404
2. 未登录用户访问 → 期望 401
3. 发送空消息 → 期望 400 + 错误提示
4. 超出限流（1 分钟内 > 60 次请求）→ 期望 429
5. 访问其他用户的会话 → 期望 403
```

这些边界测试看起来琐碎，但它们是安全的最后一道防线。没有 401 测试，你可能上线后才发现未登录用户可以随意调用 API。

## Step 5：为 AI 评分逻辑写单元测试

评分逻辑是 TalkCoach 的核心，必须有独立的单元测试。关键是 mock LLM 的响应：

```typescript
// tests/unit/scoring.test.ts
import { describe, it, expect, vi } from 'vitest'
import { parseScoreResponse } from '@/lib/scoring'

describe('parseScoreResponse', () => {
  it('should parse valid JSON score response', () => {
    const llmResponse = JSON.stringify({
      dimensions: {
        technical_depth: 75,
        clarity: 80,
        logic: 65,
      },
      feedback: '技术理解到位，但逻辑链条可以更紧凑。',
    })

    const result = parseScoreResponse(llmResponse)

    expect(result.dimensions.technical_depth).toBe(75)
    expect(result.feedback).toContain('技术理解')
  })

  it('should handle malformed LLM response gracefully', () => {
    const badResponse = '这不是 JSON 格式的回复...'

    const result = parseScoreResponse(badResponse)

    expect(result.dimensions).toEqual({})
    expect(result.error).toBeDefined()
  })

  it('should clamp scores to 0-100 range', () => {
    const response = JSON.stringify({
      dimensions: { technical_depth: 150, clarity: -10 },
    })

    const result = parseScoreResponse(response)

    expect(result.dimensions.technical_depth).toBe(100)
    expect(result.dimensions.clarity).toBe(0)
  })
})
```

LLM 的输出不可控，所以 `parseScoreResponse` 必须足够健壮——能处理非 JSON 响应、超出范围的分数、缺失字段等各种异常情况。

## Step 6：运行覆盖率报告

```bash
pnpm test --coverage
```

检查覆盖率报告，重点关注：

- `src/lib/scoring.ts` — 评分逻辑必须 > 90%
- `src/app/api/` — API 路由整体 > 80%
- 未覆盖的分支通常是错误处理路径，补充对应的边界测试

---

## 交付物检查清单

- [ ] `pnpm test` 全部通过，无失败用例
- [ ] 覆盖率报告显示 > 80%
- [ ] 边界测试覆盖 401/403/404/400/429
- [ ] 评分解析逻辑有独立的单元测试
- [ ] 测试数据库与开发数据库隔离

## 下一步

测试通过，代码质量有保障了。最后一步——把 TalkCoach 部署到公网。前往 [Lab 6：部署上线](./09-deploy.md)。
