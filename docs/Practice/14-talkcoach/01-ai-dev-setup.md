---
title: "Lab 1：配置你的 AI 开发环境"
---

# Lab 1：配置你的 AI 开发环境

> **面向人群**：完成《进阶篇》环境搭建的开发者
> **项目周期**：约 1 小时
> **最终交付**：配置好的 TalkCoach 项目骨架 + CLAUDE.md

## 前置要求

在开始之前，请确保你已经完成了 [进阶篇第 2 章：AI 调优指南](../../Advanced/02-ai-tuning-guide/) 的学习。本 Lab 会直接运用那一章讲到的 CLAUDE.md、Rules 配置和 Plan 模式等核心概念。

你还需要准备好：

- Node.js 20+ 和 pnpm
- Claude Code 或 Cursor 等 AI 编码工具
- 一个空的项目目录

---

## Step 1：创建 CLAUDE.md 项目声明

还记得第 2 章讲的"给 AI 一份项目说明书"吗？CLAUDE.md 就是你和 AI 之间的契约。打开终端，初始化项目并创建这个文件：

```bash
mkdir talkcoach && cd talkcoach
pnpm init
```

在项目根目录创建 `CLAUDE.md`，写入以下内容：

```markdown
# TalkCoach - AI 对话训练平台

## 技术栈
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- PostgreSQL (Neon) + Drizzle ORM
- Better Auth 认证
- GLM/OpenAI API + SSE 流式输出

## 项目约束
- 包管理器：pnpm（禁止使用 npm/yarn）
- 样式方案：Tailwind CSS 4，不使用 CSS Modules
- ORM：Drizzle（禁止使用 Prisma）
- 状态管理：优先使用 React 19 内置能力（use、Server Actions）
```

这份声明让 AI 在后续所有对话中都知道你的技术选型，不会给你推荐 Prisma 或者 yarn。

## Step 2：配置 Rules 规则文件

在项目中创建 `.claude/rules/` 目录，分别写两个规则文件。这些规则会在每次对话中自动注入，相当于给 AI 设定了"行为准则"。

**coding-style.md** — 编码风格约束：

```markdown
# 编码风格
- 使用不可变模式：NEVER mutate objects, always spread
- 函数体不超过 50 行，文件不超过 800 行
- 组件按功能拆分，一个文件一个职责
- 使用 zod 做运行时类型校验
```

**security.md** — 安全规则：

```markdown
# 安全规则
- API Key 只能从 process.env 读取，禁止硬编码
- 所有用户输入必须经过 zod 校验
- 数据库查询使用参数化，禁止字符串拼接
- .env 文件必须在 .gitignore 中
```

## Step 3：用记忆命令建立项目上下文

在 AI 对话中输入以下内容（注意开头的 `#` 号，这是记忆命令的语法）：

```
# 本项目是 TalkCoach —— AI 对话训练平台，支持多场景角色扮演训练。
# 内置 4 个场景：前端面试（技术面试官）、英语口语（英语老师）、产品路演（投资人）、客服训练（愤怒客户）。
# 每个场景有独立的评分维度，训练结束后生成报告。
```

这样 AI 在后续对话中会始终记住项目的核心定位，不需要你每次都重复解释。

## Step 4：用 Plan 模式分析项目需求

切换到 Plan 模式，输入：

```
请分析 TalkCoach 项目的技术方案，输出：
1. 目录结构建议
2. 核心页面路由设计
3. 数据模型概要
4. API 端点列表
5. 第三方依赖清单
```

Plan 模式的价值在于——AI 不会直接动手写代码，而是先给你一份完整的技术蓝图。你可以在这个阶段纠正方向，比代码写完再改便宜得多。

:::tip
仔细审查 AI 输出的方案。重点关注：路由设计是否合理、数据模型是否遗漏了关键实体、依赖是否有更轻量的替代品。
:::

## Step 5：用 Bug Fix 模板演练 AI 调试

为了体验 AI 的调试能力，我们故意引入一个类型错误。创建 `src/types/scenario.ts`：

```typescript
// 故意写错：difficulty 应该是联合类型，这里写成了 number
interface Scenario {
  id: string
  title: string
  description: string
  difficulty: number  // BUG: 应该是 'easy' | 'medium' | 'hard'
  icon: string
}

const scenarios: Scenario[] = [
  { id: '1', title: '前端面试', description: '模拟技术面试', difficulty: 'medium', icon: '💻' }
]
```

然后告诉 AI：

```
这段代码有类型错误，请帮我诊断并修复。请说明错误原因和修复方案。
```

观察 AI 是否能准确定位问题（`difficulty` 的类型定义与实际赋值不匹配），并给出合理的修复方案。这就是第 2 章讲的"AI 调试工作流"的实战演练。

---

## 交付物检查清单

- [ ] 项目根目录有 `CLAUDE.md`
- [ ] `.claude/rules/` 下有 `coding-style.md` 和 `security.md`
- [ ] AI 记忆中包含 TalkCoach 项目上下文
- [ ] Plan 模式输出了完整的技术方案
- [ ] 成功用 AI 修复了类型错误

## 下一步

环境配置好了，接下来我们要把脑海中的想法变成一份正式的产品需求文档。前往 [Lab 2：从想法到 PRD](./02-prd-workshop.md)。
