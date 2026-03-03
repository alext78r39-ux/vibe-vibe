---
title: "Lab 4：设计数据库 Schema"
---

# Lab 4：设计数据库 Schema

> **面向人群**：完成 Lab 3 的开发者
> **项目周期**：约 1-2 小时
> **最终交付**：8 张表在 Drizzle Studio 中可见

## 前置要求

- 完成 [Lab 3：构建训练界面](./03-interview-ui.md)
- 阅读 [进阶篇第 6 章：数据持久化](../../Advanced/06-data-persistence-database/)

---

## Step 1：从 PRD 提取实体

打开你在 Lab 2 生成的 PRD.md，让 AI 帮你识别核心实体：

```
请根据 PRD.md 提取所有数据实体及其关系，用 ER 图的思路列出：
- 实体名称
- 核心字段
- 实体间关系（1:N, N:M）
```

TalkCoach 的核心实体应该包含以下 8 张表：

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| users | 用户 | id, email, name, avatar |
| scenario_templates | 场景模板 | id, title, role_description, dimensions (JSONB) |
| training_sessions | 训练会话 | id, user_id, scenario_id, status, started_at |
| messages | 对话消息 | id, session_id, role, content, score (JSONB) |
| training_reports | 训练报告 | id, session_id, overall_score, dimension_scores (JSONB) |
| report_shares | 报告分享 | id, report_id, share_token, expires_at |
| user_stats | 用户统计 | id, user_id, scenario_id, total_sessions, avg_score |
| accounts | 认证账户 | id, user_id, provider, provider_account_id |

如果 AI 遗漏了 `report_shares` 或 `user_stats`，提醒它——分享功能和统计功能是 PRD 中明确要求的。

## Step 2：让 AI 生成 Drizzle Schema

把实体表格发给 AI，让它生成完整的 Drizzle schema：

```
请用 Drizzle ORM 为以上 8 张表生成 PostgreSQL schema。
要求：
- 使用 pgTable 定义
- 主键用 uuid + defaultRandom()
- 时间字段用 timestamp with timezone
- JSONB 字段用 jsonb 类型
- 定义完整的 relations
- 导出所有表和关系
```

安装 Drizzle 相关依赖：

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

## Step 3：审查关键设计决策

AI 生成的 schema 不能直接用，你需要审查几个关键点：

### 评分维度用 JSONB

面试场景的维度是"技术深度、表达清晰度"，口语场景的维度是"语法准确性、发音流畅度"。如果用固定列，每加一个场景就要改表结构。JSONB 让每个场景可以自由定义自己的维度：

```typescript
// scenario_templates.dimensions 的结构
[
  { key: 'technical_depth', label: '技术深度', weight: 0.3 },
  { key: 'clarity', label: '表达清晰度', weight: 0.25 },
]
```

### 会话状态枚举

训练会话有明确的生命周期，用枚举约束状态流转：

```typescript
export const sessionStatusEnum = pgEnum('session_status', [
  'preparing',    // 选择场景，还没开始
  'in_progress',  // 训练进行中
  'completed',    // 用户主动结束
  'reviewed',     // 报告已生成
])
```

### 索引策略

让 AI 补充索引。最关键的是用户查询自己的训练历史——按 `user_id + created_at DESC` 建复合索引，避免全表扫描：

```
请为以下查询场景添加索引：
1. 用户查看自己的训练历史（user_id + created_at）
2. 通过分享 token 查找报告（share_token 唯一索引）
3. 查看某次会话的所有消息（session_id + created_at）
```

## Step 4：AI 交叉论证

这是第 6 章讲的"第二意见"策略。开一个新的 AI 对话窗口，把生成的 schema 发过去：

```
请审查这份 Drizzle schema 的设计合理性：
1. 是否有冗余字段？
2. JSONB 的使用是否合理，有没有应该拆成独立表的？
3. 索引是否覆盖了主要查询场景？
4. 是否有潜在的性能瓶颈？
```

:::warning
不要跳过这一步。Schema 设计的错误在后期修复成本极高——数据迁移、API 改动、前端适配，牵一发动全身。花 10 分钟交叉验证，能省后面 10 小时的返工。
:::

## Step 5：推送到 Neon 并验证

配置 Neon 数据库连接，然后用 Drizzle Kit 推送 schema：

```bash
# .env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/talkcoach?sslmode=require"
```

```bash
pnpm drizzle-kit push
```

推送成功后，启动 Drizzle Studio 验证表结构：

```bash
pnpm drizzle-kit studio
```

在 Studio 中逐一检查：8 张表是否都存在、字段类型是否正确、JSONB 字段是否可以插入测试数据。

---

## 交付物检查清单

- [ ] 8 张表在 Drizzle Studio 中可见
- [ ] JSONB 字段结构合理（dimensions、score）
- [ ] 会话状态枚举定义正确
- [ ] 关键查询场景有索引覆盖
- [ ] 至少经过一轮交叉论证

## 下一步

数据库就绪，接下来可以开始实现后端 API 和 AI 对话逻辑了。完成 Pset 1-3 的练习后，前往 [Lab 5：为 API 写测试](./08-api-testing.md)。
