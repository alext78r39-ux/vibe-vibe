---
title: "Pset 1：数据层实现"
---

# Pset 1：数据层实现

> **类型**：Problem Set（规格驱动）
> **对应章节**：[第六章：数据持久化与数据库](../../Advanced/06-data-persistence-database/)
> **预计耗时**：2-3 小时
> **交付物**：完整的 Drizzle Schema + 可运行的种子脚本

## 前置要求

- 已完成 Lab 4（项目初始化与数据库连接）
- 已阅读[第六章：数据持久化与数据库](../../Advanced/06-data-persistence-database/)，理解 Drizzle ORM 的 Schema 定义方式
- PostgreSQL 数据库已就绪，`DATABASE_URL` 已配置

## 规格说明

### 1. Schema 定义（8 张表）

实现完整的 TalkCoach 数据模型。Better Auth 会自动管理 `users`、`session`（认证会话）、`account` 三张表，你需要额外定义以下业务表：

- `scenarios` — 训练场景（内置 + 用户自定义），包含 AI 角色的 system prompt 和评估维度
- `training_sessions` — 训练会话记录，关联场景和用户
- `messages` — 对话消息，关联训练会话
- `reports` — 训练报告，关联训练会话

每张表都需要定义合理的索引。例如 `training_sessions` 需要 `userId` 索引（按用户查询历史）和 `scenarioId` 索引（按场景统计）。没有索引的外键查询在数据量增长后会变成全表扫描——这是新手最常踩的性能坑。

场景表是本项目的核心，评估维度使用 JSONB 存储以支持不同场景的灵活配置：

```typescript
// src/db/schema/scenarios.ts
export const scenarios = pgTable("scenarios", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  systemPrompt: text("system_prompt").notNull(),       // AI 角色扮演指令
  dimensions: jsonb("dimensions").notNull().$type<{     // 评估维度（JSONB）
    name: string;
    weight: number;        // 权重，所有维度权重之和 = 1
    criteria: string;      // 评分标准描述
  }[]>(),
  openingLines: jsonb("opening_lines").notNull().$type<{
    beginner: string;
    intermediate: string;
    advanced: string;
  }>(),
  isBuiltin: boolean("is_builtin").default(false),
  creatorId: text("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 2. 会话状态枚举

训练会话有明确的生命周期。使用 PostgreSQL 枚举类型定义状态流转，防止出现非法状态：

```
PREPARING → IN_PROGRESS → COMPLETED → REVIEWED
```

`PREPARING` 是用户选择场景后、开始对话前的准备阶段；`COMPLETED` 表示对话结束但尚未生成报告；`REVIEWED` 表示报告已生成。状态只能单向流转，不可回退。

### 3. 关联关系

- `training_sessions.scenarioId → scenarios.id` — 每次训练基于一个场景
- `training_sessions.userId → users.id` — 每次训练属于一个用户
- `messages.sessionId → training_sessions.id` — 消息属于训练会话（级联删除）
- `reports.sessionId → training_sessions.id` — 报告属于训练会话（一对一）

### 4. 种子脚本

编写 `src/db/seed.ts`，通过 `pnpm db:seed` 执行。包含 4 个内置场景，每个场景需要完整定义 system prompt、评估维度和三级开场白。

以下是"前端面试"场景的种子数据示例：

```typescript
const frontendInterview = {
  name: "前端面试",
  description: "模拟真实的前端技术面试，覆盖框架原理、性能优化、工程化等话题",
  systemPrompt: `你是一位有 8 年经验的前端技术面试官，就职于一线互联网公司。
你的面试风格严谨但不刻薄，会根据候选人的回答深入追问。
如果候选人回答模糊，你会要求给出具体例子或代码。
不要直接给出答案，而是通过追问引导候选人思考。`,
  dimensions: [
    { name: "技术深度", weight: 0.3, criteria: "对核心概念的理解程度，能否解释底层原理" },
    { name: "表达清晰度", weight: 0.25, criteria: "回答是否有条理，能否用简洁语言解释复杂概念" },
    { name: "实战经验", weight: 0.25, criteria: "是否能结合真实项目经验，给出具体案例" },
    { name: "逻辑思维", weight: 0.2, criteria: "分析问题的思路是否清晰，能否举一反三" },
  ],
  openingLines: {
    beginner: "你好，我是今天的面试官。我们先从基础开始——能聊聊你对 React 组件生命周期的理解吗？",
    intermediate: "你好，看了你的简历，项目经验不错。我想深入聊聊——你在项目中是怎么做性能优化的？",
    advanced: "你好，直接进入正题。假设你要从零设计一个大型前端应用的状态管理方案，你会怎么考虑？",
  },
  isBuiltin: true,
};
```

其余 3 个场景（英语口语、产品路演、客服培训）按相同结构定义，确保每个场景的维度权重之和为 1。

## 里程碑

| # | 阶段 | 完成标志 |
|---|------|---------|
| 1 | Schema 定义 | 所有 8 张表的 TypeScript 定义完成，类型无报错 |
| 2 | 迁移推送 | `pnpm db:push` 成功，数据库中可见所有表 |
| 3 | 种子脚本 | `pnpm db:seed` 成功，4 个场景写入数据库 |
| 4 | Drizzle Studio 验证 | `pnpm db:studio` 中可查询所有场景及其维度数据 |

## 验收标准

- `pnpm db:push` 无报错，数据库中存在全部 8 张表
- `pnpm db:seed` 无报错，`scenarios` 表中有 4 条记录
- 在 Drizzle Studio 中点击任意场景，`dimensions` 字段显示为结构化的 JSON 数组
- 所有外键关系正确，删除不存在的关联 ID 时数据库抛出约束错误

:::warning 常见陷阱
JSONB 字段在 Drizzle 中需要用 `.$type<T>()` 显式标注 TypeScript 类型，否则查询结果会是 `unknown`。别忘了这一步，后续 API 层会依赖这些类型。
:::

## 下一步

完成数据层后，进入 [Pset 2：API 与 AI 对话引擎](./06-api-with-ai.md)，在数据模型之上构建完整的 API 层和 AI 对话能力。
