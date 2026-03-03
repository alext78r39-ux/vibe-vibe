---
title: "Lab 6：部署上线"
---

# Lab 6：部署上线

> **面向人群**：完成 Lab 5 的开发者
> **项目周期**：约 30 分钟 - 1 小时
> **最终交付**：公网可访问的 TalkCoach + 报告分享功能正常

## 前置要求

- 完成 [Lab 5：为 API 写测试](./08-api-testing.md)
- 阅读 [进阶篇第 12 章：部署与 CI/CD](../../Advanced/12-serverless-deploy-cicd/)

---

## Step 1：推送代码到 GitHub

部署前先确保代码安全。检查 `.gitignore` 是否包含敏感文件：

```bash
# 确认 .env 不会被提交
cat .gitignore | grep -E "\.env"
```

如果没有，手动添加：

```bash
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

创建一份 `.env.example` 作为模板，方便其他开发者知道需要哪些环境变量（值留空）：

```bash
DATABASE_URL=
OPENAI_API_KEY=
AUTH_SECRET=
AUTH_URL=
```

然后推送到 GitHub：

```bash
git init && git add . && git commit -m "feat: TalkCoach MVP"
gh repo create talkcoach --public --push
```

## Step 2：连接 Vercel

还记得第 12 章讲的一键部署吗？Vercel 对 Next.js 项目的支持是开箱即用的：

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 "Import Project"，选择刚推送的 `talkcoach` 仓库
3. Framework Preset 会自动识别为 Next.js，保持默认即可
4. 先不要点 Deploy——我们还需要配置环境变量

:::tip
如果你更熟悉 EdgeOne Pages，流程类似。关键是确保平台支持 Node.js 运行时（Next.js 的 API Routes 需要服务端执行）。
:::

## Step 3：配置环境变量

在 Vercel 的 Settings → Environment Variables 中添加以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | Neon 数据库连接串 | `postgresql://user:pass@ep-xxx.neon.tech/talkcoach` |
| `OPENAI_API_KEY` | GLM 或 OpenAI 的 API Key | `sk-xxx` |
| `AUTH_SECRET` | Better Auth 签名密钥 | 用 `openssl rand -base64 32` 生成 |
| `AUTH_URL` | 认证回调地址 | `https://your-domain.vercel.app` |

:::warning
`AUTH_URL` 必须和实际部署域名一致，否则 OAuth 回调会失败。第一次部署后 Vercel 会分配一个 `.vercel.app` 域名，把它填到这里。
:::

## Step 4：部署并验证场景

点击 Deploy，等待构建完成。部署成功后，逐一验证：

1. 首页加载正常，4 个场景卡片都能显示
2. 点击任意场景，进入聊天界面
3. 发送一条消息，AI 能正常回复（流式输出）
4. 评分面板实时更新
5. 结束训练后能生成报告

如果遇到 500 错误，大概率是环境变量没配对。去 Vercel 的 Functions 日志里看具体报错信息。

## Step 5：测试报告分享功能

报告分享是 TalkCoach 的亮点功能——用户可以把训练报告分享给朋友或面试教练。

1. 完成一次训练，生成报告
2. 点击"分享"按钮，获取分享链接
3. 在浏览器无痕模式下打开分享链接（模拟未登录用户）
4. 确认报告内容可以正常查看，但不能修改

分享链接的格式类似 `https://your-domain.vercel.app/report/share/[token]`，token 是一次性生成的随机字符串，存在 `report_shares` 表中。

## Step 6：配置自动部署

让每次 push 到 main 分支都自动触发部署：

1. Vercel 默认已经配置了 Git Integration，push 到 main 会自动部署
2. 验证：本地做一个小改动，push 到 main
3. 在 Vercel Dashboard 确认新的 Deployment 被触发

如果你想更严谨，可以配置 Preview Deployments——每个 PR 自动部署一个预览环境，方便 Code Review 时直接看效果。

---

## 交付物检查清单

- [ ] 代码已推送到 GitHub，`.env` 未被提交
- [ ] Vercel 部署成功，公网可访问
- [ ] 4 个内置场景全部可用
- [ ] AI 对话流式输出正常
- [ ] 报告分享链接在无痕模式下可访问
- [ ] push to main 自动触发部署

---

## 恭喜完成

你从零开始，经历了环境配置、需求分析、UI 构建、数据库设计、API 开发、测试编写，一直到部署上线——完整走过了一个全栈项目的生命周期。

TalkCoach 不只是一个练手项目。你在这个过程中掌握的 AI 辅助开发工作流、PRD 驱动的开发方式、测试先行的质量意识，这些能力可以迁移到任何项目中。

接下来你可以继续扩展 TalkCoach：加入语音输入、支持用户自定义场景、接入更多 LLM 模型、做付费订阅。每一个方向都是一个新的学习机会。

祝你 Vibe Coding 愉快。