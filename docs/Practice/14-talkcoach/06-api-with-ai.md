---
title: "Pset 2：API 与 AI 对话引擎"
---

# Pset 2：API 与 AI 对话引擎

> **类型**：Problem Set（规格驱动）
> **对应章节**：[第七章：后端 API 开发](../../Advanced/07-backend-api/)
> **预计耗时**：4-6 小时
> **交付物**：完整的 API 层 + SSE 流式对话 + 动态评分 + 报告生成

这是 TalkCoach 项目的核心 Pset。你将把 Pset 1 中定义的数据模型"激活"——让 AI 真正扮演不同角色，与用户实时对话，并在每轮对话后给出评分。

## 前置要求

- 已完成 [Pset 1：数据层实现](./05-data-layer.md)，数据库中已有 4 个内置场景
- 已阅读[第七章：后端 API 开发](../../Advanced/07-backend-api/)，理解 Next.js API Route 的工作方式
- GLM 或 OpenAI 兼容 API 的密钥已配置在 `.env` 中

## 规格说明

### 1. 场景管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/scenarios` | GET | 返回场景列表（内置 + 当前用户自定义） |
| `/api/scenarios` | POST | 创建自定义场景（需定义 AI 角色 prompt + 评估维度） |

用户可以创建自己的训练场景——比如"产品经理面试"或"日语商务会话"。自定义场景的结构与内置场景完全一致，这样后续的对话引擎和评分逻辑可以统一处理，不需要为不同来源的场景写不同的代码。

### 2. 训练会话 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/sessions` | POST | 创建训练会话（选择场景 + 难度级别） |
| `/api/sessions` | GET | 当前用户的训练历史列表 |
| `/api/sessions/[id]` | GET | 会话详情 + 完整消息记录 |

创建会话时，后端需要根据用户选择的难度级别，从场景的 `openingLines` 中取出对应的开场白，作为 AI 的第一条消息自动写入 `messages` 表。这样用户进入对话页面时就能立刻看到 AI 角色的开场白，而不是一片空白。

### 3. AI 对话端点（核心）

**`POST /api/sessions/[id]/chat`** — SSE 流式对话

这是整个项目最关键的端点。它需要做三件事：

1. 根据场景的 system prompt 构建 AI 角色上下文
2. 将历史对话作为 messages 数组传给 AI
3. 使用 ReadableStream 实现 SSE，让前端实时显示打字效果

**动态 System Prompt 构建**：不同场景 = 不同 AI 角色。system prompt 从数据库动态读取，而不是硬编码：

```typescript
// 从场景数据动态构建 system prompt
function buildSystemPrompt(scenario: Scenario, difficulty: string) {
  return `${scenario.systemPrompt}

当前难度级别：${difficulty}
评估维度：${scenario.dimensions.map(d => `${d.name}（权重${d.weight}）: ${d.criteria}`).join("\n")}

【重要】每次回复后，你需要在回复末尾附加一个 JSON 评分块，格式如下：
<!--SCORE_START-->
{"scores": [{"dimension": "维度名", "score": 85, "comment": "简短点评"}]}
<!--SCORE_END-->
评分范围 0-100，基于上述维度的评分标准打分。这个评分块会被系统解析，用户不会直接看到。`;
}
```

**SSE 流式响应**：使用 Web 标准的 ReadableStream，不依赖第三方库：

```typescript
// app/api/sessions/[id]/chat/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { message } = await req.json();
  // ... 验证会话、保存用户消息、构建上下文（省略）

  const aiResponse = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        { role: "system", content: buildSystemPrompt(scenario, session.difficulty) },
        ...historyMessages,
        { role: "user", content: message },
      ],
      stream: true,
    }),
  });

  // 将上游 SSE 转发给前端
  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiResponse.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        controller.enqueue(new TextEncoder().encode(chunk));
        // 累积完整内容用于后续评分解析
        fullContent += extractContentFromSSE(chunk);
      }

      // 流结束后：保存 AI 消息 + 解析评分
      await saveMessageAndScores(session.id, fullContent);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
```

关键设计：AI 的回复中嵌入了评分 JSON 块（用 HTML 注释包裹），前端渲染时过滤掉这个块，只显示对话内容。后端在流结束后解析评分并存入数据库。这样做的好处是只需要一次 AI 调用就同时完成了"对话"和"评分"两个任务。

### 4. 报告生成端点

**`POST /api/sessions/[id]/report`** — 生成训练报告

对话结束后，用户点击"生成报告"。后端将该会话的全部对话记录发送给 AI，要求按场景定义的维度生成综合评价：

```typescript
// 报告生成的 prompt 结构
const reportPrompt = `请分析以下对话记录，生成训练报告。

评估维度：${dimensions.map(d => d.name).join("、")}

请严格按以下 JSON 格式输出：
{
  "totalScore": 78,
  "dimensionScores": [
    { "name": "技术深度", "score": 82, "analysis": "详细分析..." }
  ],
  "strengths": ["强项1", "强项2"],
  "weaknesses": ["弱项1", "弱项2"],
  "suggestions": ["改进建议1", "改进建议2"],
  "summary": "一段话的综合评价"
}`;
```

报告生成后，同时生成一个唯一的 `shareToken`（用于 Pset 3 的公开分享链接），并将会话状态更新为 `REVIEWED`。

### 5. 技术要求

- 所有请求输入使用 Zod 验证。不要相信任何来自前端的数据——即使是你自己写的前端
- 统一错误响应格式：`{ success: boolean, data?: T, error?: string }`
- AI 端点使用 GLM/OpenAI 兼容 API，通过环境变量切换模型和 base URL

:::tip 调试建议
开发 SSE 端点时，先用 `curl` 测试流式输出是否正常，再接入前端。浏览器的 Network 面板对 SSE 的展示不够直观，`curl` 能让你直接看到原始的 chunk 数据。
:::

## 里程碑

| # | 阶段 | 完成标志 |
|---|------|---------|
| 1 | 场景 CRUD | GET/POST `/api/scenarios` 正常工作 |
| 2 | 会话管理 | 创建会话后能看到 AI 开场白 |
| 3 | AI 对话 SSE | `curl` 测试流式输出，能看到逐字返回 |
| 4 | 动态评分 | 不同场景的评分维度不同，分数写入数据库 |
| 5 | 报告生成 | 生成的报告包含总分、维度分析、改进建议 |

## 验收标准

- 选择"前端面试"场景，AI 扮演面试官；切换到"英语口语"，AI 变成英语外教
- 每轮对话后，数据库中有对应的维度评分记录
- 评分维度随场景变化（面试场景评"技术深度"，口语场景评"语法准确度"）
- 报告包含结构化的 JSON 数据：总分、各维度分析、强项、弱项、改进建议
- 所有端点对非法输入返回清晰的错误信息，不会 500

## 下一步

API 层就绪后，进入 [Pset 3：认证与安全](./07-auth-system.md)，为所有端点加上认证保护和安全策略。
