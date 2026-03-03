---
title: "Lab 3：构建训练界面"
---

# Lab 3：构建训练界面

> **面向人群**：完成 Lab 2 的开发者
> **项目周期**：约 2-3 小时
> **最终交付**：可运行的 UI 原型（使用 mock 数据）

## 前置要求

- 完成 [Lab 2：从想法到 PRD](./02-prd-workshop.md)
- 阅读 [进阶篇第 5 章：UI/UX](../../Advanced/05-ui-ux/)

---

## Step 1：初始化项目脚手架

还记得第 5 章讲的组件库选择吗？TalkCoach 选用 shadcn/ui，因为它不是黑盒——每个组件的源码都在你项目里，方便 AI 直接修改。

让 AI 帮你一键搭建：

```bash
pnpm create next-app@latest talkcoach --typescript --tailwind --app --src-dir
cd talkcoach
pnpm dlx shadcn@latest init
```

然后安装必要的 shadcn 组件：

```bash
pnpm dlx shadcn@latest add card button badge avatar textarea
```

:::tip
用 `--src-dir` 把代码放在 `src/` 下，保持根目录整洁。这是 Next.js 15 的推荐做法。
:::

## Step 2：构建场景选择页

这是用户进入 TalkCoach 后看到的第一个页面。先定义场景的数据结构：

```typescript
// src/types/scenario.ts
interface ScenarioDimension {
  key: string
  label: string
  weight: number
}

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  icon: string
  roleDescription: string   // AI 扮演的角色说明
  dimensions: ScenarioDimension[]  // 评分维度
}
```

注意 `dimensions` 字段——不同场景的评分维度完全不同。面试场景关注"技术深度"和"表达清晰度"，口语场景关注"语法准确性"和"发音流畅度"。这个设计决策会贯穿整个项目。

告诉 AI 构建场景选择页：

```
请基于 Scenario 类型，构建场景选择页 src/app/page.tsx：
- 卡片网格布局（响应式：移动端 1 列，平板 2 列，桌面 4 列）
- 每张卡片包含：图标、标题、描述、难度标签（用 Badge 组件）
- 点击卡片跳转到 /chat/[scenarioId]
- 使用 mock 数据，4 个内置场景
```

卡片的难度标签用不同颜色区分：`easy` 绿色、`medium` 黄色、`hard` 红色。这种视觉暗示能帮助用户快速做出选择。

## Step 3：构建聊天界面

聊天界面是 TalkCoach 的核心交互区域。消息气泡的设计要区分 AI 角色和用户：

```typescript
// src/types/message.ts
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  score?: Record<string, number>  // 单轮评分，key 是维度
}
```

告诉 AI：

```
请构建聊天页面 src/app/chat/[scenarioId]/page.tsx：
- 顶部：场景名称 + AI 角色说明 + 结束训练按钮
- 中间：消息列表（AI 消息靠左带角色头像，用户消息靠右）
- 底部：输入框 + 发送按钮
- AI 消息需要支持流式打字效果（逐字显示）
- 使用 mock 数据模拟对话
```

流式打字效果是用户体验的关键。没有它，用户需要等 AI 完整生成后才能看到回复，等待感会非常强烈。后续接入真实 API 时，我们会用 SSE 实现真正的流式输出，但现在先用 `setInterval` 模拟逐字显示。

:::warning
消息列表要自动滚动到底部。这是聊天界面最容易忽略的细节——新消息出现时如果用户需要手动滚动，体验会很糟糕。用 `useEffect` + `scrollIntoView` 解决。
:::

## Step 4：构建实时评分面板

评分面板是 TalkCoach 区别于普通聊天机器人的核心功能。维度由场景动态决定：

```typescript
// src/components/score-panel.tsx
interface ScorePanelProps {
  dimensions: ScenarioDimension[]
  scores: Record<string, number>  // 0-100 分
}
```

告诉 AI：

```
请构建评分面板组件 src/components/score-panel.tsx：
- 接收场景维度定义和当前分数
- 每个维度用进度条展示（0-100）
- 进度条颜色根据分数变化：< 40 红色，40-70 黄色，> 70 绿色
- 底部显示综合得分（各维度加权平均）
- 分数变化时有平滑过渡动画
```

面试场景的维度示例：技术深度（30%）、表达清晰度（25%）、逻辑结构（25%）、问题理解（20%）。这些权重在场景模板中定义，评分面板只负责展示。

## Step 5：添加 Motion 动画

静态界面能用，但加上动画才有"产品感"。安装 Motion：

```bash
pnpm add motion
```

告诉 AI 添加三处动画：

```
请为以下交互添加 Motion 动画：
1. 消息气泡：从底部滑入（y: 20 → 0, opacity: 0 → 1）
2. 评分变化：数字和进度条用 spring 动画过渡
3. 场景卡片：hover 时轻微上浮（y: -4）+ 阴影加深
```

动画要克制。过度的动画会让用户觉得"花哨但不好用"。消息滑入用 200ms，评分过渡用 300ms，卡片 hover 用 150ms——这些时长经过大量产品验证，是比较舒适的节奏。

---

## 交付物检查清单

- [ ] 场景选择页展示 4 张卡片，响应式布局正常
- [ ] 聊天界面消息气泡区分 AI 和用户
- [ ] 流式打字效果可见（mock 模拟）
- [ ] 评分面板根据场景动态展示不同维度
- [ ] 动画效果自然，不突兀
- [ ] `pnpm dev` 可正常运行，无报错

## 下一步

界面有了，但数据还是假的。接下来我们要设计真正的数据库结构，让这些界面能连上真实数据。前往 [Lab 4：设计数据库 Schema](./04-schema-design.md)。