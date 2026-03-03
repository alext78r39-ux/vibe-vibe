---
title: "TalkCoach：AI 对话训练平台"
---

# TalkCoach：AI 对话训练平台

TalkCoach 是一个多场景 AI 角色扮演 + 实时评分的对话训练平台。用户选择场景后，AI 会扮演对应角色（面试官、外教、投资人、愤怒客户……）与你实时对话，结束后从多个维度给出评分和改进建议。

这是一个 CS50 风格的 Lab/Pset 项目，贯穿《进阶篇》多个章节。每完成一章理论学习，就来这里做对应的实验，把知识焊死在手上。

## 为什么选这个项目

- **直击痛点**：面试焦虑、社交恐惧、语言学习——几乎每个人都需要"安全地练习对话"
- **天然传播**："我英语面试模拟得了 92 分！"——自带社交货币属性
- **技术含量**：实时 AI 对话 + 多维评分 + SSE 流式响应 + 多场景切换，涵盖全栈核心技能
- **实用价值**：面试前练面试、出国前练口语、路演前练表达——做完就能用

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 框架 | Next.js 15 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 数据库 | PostgreSQL + Drizzle ORM |
| 认证 | Better Auth（邮箱/密码 + GitHub OAuth） |
| AI | GLM/OpenAI API（AI 角色扮演 + 评分） |
| 通信 | SSE 流式响应 |

## 内置场景

| 场景 | AI 角色 | 评估维度 |
|------|--------|---------|
| 前端面试 | 技术面试官 | 技术深度、表达清晰度、实战经验、逻辑思维 |
| 英语口语 | 英语外教 | 语法准确度、词汇丰富度、流利度、发音描述 |
| 产品路演 | 投资人 | 商业逻辑、市场洞察、表达感染力、数据支撑 |
| 客服培训 | 愤怒客户 | 情绪管理、问题解决、专业度、响应速度 |

## 学习路线

```
Lab 1 (Ch.2) → Lab 2 (Ch.3) → Lab 3 (Ch.5) → Lab 4 (Ch.6)
     → Pset 1 (Ch.6) → Pset 2 (Ch.7) → Pset 3 (Ch.8)
          → Lab 5 (Ch.9) → Lab 6 (Ch.12)
```

| 序号 | 类型 | 标题 | 对应章节 | 简介 |
|------|------|------|---------|------|
| 1 | Lab | [配置 AI 开发环境](./01-ai-dev-setup.md) | Ch.2 环境搭建 | 搭建 Next.js + TypeScript 项目，配置 AI 开发工具链 |
| 2 | Lab | [从想法到 PRD](./02-prd-workshop.md) | Ch.3 需求文档 | 用 AI 辅助撰写 TalkCoach 的产品需求文档 |
| 3 | Lab | [构建训练界面](./03-interview-ui.md) | Ch.5 UI/UX | 用 shadcn/ui 搭建场景选择、对话窗口、评分面板 |
| 4 | Lab | [设计数据库 Schema](./04-schema-design.md) | Ch.6 数据库 | 用 Drizzle ORM 设计用户、场景、会话、消息表 |
| 5 | Pset | [数据层实现](./05-data-layer.md) | Ch.6 数据库 | 实现完整的数据访问层，CRUD + 事务 + 迁移 |
| 6 | Pset | [API 与 AI 对话引擎](./06-api-with-ai.md) | Ch.7 后端 API | 构建 RESTful API + SSE 流式 AI 对话 + 多维评分 |
| 7 | Pset | [认证与安全](./07-auth-system.md) | Ch.8 认证安全 | 集成 Better Auth，实现邮箱/GitHub 登录 + 路由保护 |
| 8 | Lab | [为 API 写测试](./08-api-testing.md) | Ch.9 测试 | 用 Vitest 编写 API 单元测试和集成测试 |
| 9 | Lab | [部署上线](./09-deploy.md) | Ch.12 部署 | 部署到 Vercel/EdgeOne，配置环境变量和数据库 |

## 前置要求

- 完成《基础篇》全部内容
- 完成《进阶篇》前 2 章（环境搭建 + AI 调优指南）

准备好了就从 [Lab 1：配置 AI 开发环境](./01-ai-dev-setup.md) 开始吧。
