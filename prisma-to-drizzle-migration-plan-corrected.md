# Prisma → Drizzle 替换方案（符合官方最佳实践）

**总览：26处需要修改**

**参考来源：** Drizzle ORM 官方文档 `/drizzle-team/drizzle-orm-docs`

---

## 关键修正说明

根据 Drizzle ORM 官方文档，以下技术细节已验证：

✅ **安装命令**：`pnpm add drizzle-orm pg` 和 `pnpm add -D drizzle-kit`
✅ **配置文件**：`drizzle.config.ts`（使用 `defineConfig`）
✅ **Schema 定义**：使用 `pgTable`，`serial`，`text`，`integer` 等
✅ **项目结构**：`src/db/schema.ts`，`src/db/index.ts`
✅ **命令**：`npx drizzle-kit push`，`npx drizzle-kit studio`
✅ **数据库连接**：`drizzle({ client: pool })` 或 `drizzle(connectionString)`
✅ **无需 generate 步骤**：Drizzle Schema 本身就是 TypeScript

---

## 第一章：环境搭建与代码运行基础（10处）

### 修改 1.1 - 技术栈图表
**文件：** `docs/Advanced/01-environment-setup/02-tech-stack.md`
**位置：** 第56行
**原文：**
```markdown
| **数据库 ORM** | Prisma ORM | 类型安全的数据库操作 |
```
**建议替换为：**
```markdown
| **数据库 ORM** | Drizzle ORM | 类型安全的数据库操作 |
```

---
**用户评论/编辑区域：**



---

### 修改 1.2 - 依赖识别说明
**文件：** `docs/Advanced/01-environment-setup/02-tech-stack.md`
**位置：** 第204行
**原文：**
```markdown
| `@prisma/client` | Prisma 数据库 ORM |
```
**建议替换为：**
```markdown
| `drizzle-orm` | Drizzle 数据库 ORM |
```

---
**用户评论/编辑区域：**



---

### 修改 1.3 - 技术栈对比说明
**文件：** `docs/Advanced/01-environment-setup/02-tech-stack.md`
**位置：** 第220行
**原文：**
```markdown
对比说明 "Prisma 用来操作数据库"
```
**建议替换为：**
```markdown
对比说明 "Drizzle ORM 用来操作数据库"
```

---
**用户评论/编辑区域：**



---

### 修改 1.4 - 工具列表
**文件：** `docs/Advanced/01-environment-setup/06-models-and-tools.md`
**位置：** 第154行
**原文：**
```markdown
| Prisma Studio | 可视化 Prisma 数据库 |
```
**建议替换为：**
```markdown
| Drizzle Studio | 可视化 Drizzle 数据库 |
```

---
**用户评论/编辑区域：**



---

### 修改 1.5 - Studio 使用说明
**文件：** `docs/Advanced/01-environment-setup/06-models-and-tools.md`
**位置：** 第272-276行
**原文：**
```markdown
```bash
npx prisma studio
```
```
**建议替换为：**
```markdown
```bash
npx drizzle-kit studio
```
```

---
**用户评论/编辑区域：**



---

### 修改 1.6 - 项目初始化命令（已修正）
**文件：** `docs/Advanced/01-environment-setup/07-creating-project.md`
**位置：** 第385-390行
**原文：**
```markdown
```bash
npx prisma init
pnpm add @prisma/client
pnpm add -D prisma
```
```
**建议替换为：**
```markdown
```bash
# 安装 Drizzle ORM 和 PostgreSQL 驱动
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit

# 创建配置文件
# drizzle.config.ts
```
```

---
**用户评论/编辑区域：**



---

### 修改 1.7 - 项目结构说明（已修正）
**文件：** `docs/Advanced/01-environment-setup/07-creating-project.md`
**位置：** 第258-260行
**原文：**
```markdown
```
my-next-prisma-app/
├── prisma/                  <-- 【数据库层】Prisma 的核心文件夹
│   ├── schema.prisma        # 数据库模型定义文件 (最重要)
```
```
**建议替换为：**
```markdown
```
my-next-app/
├── src/
│   └── db/
│       ├── schema.ts        # 数据库模型定义文件
│       └── index.ts         # Drizzle 客户端实例
├── drizzle.config.ts        # Drizzle Kit 配置文件
```
```

---
**用户评论/编辑区域：**



---

### 修改 1.8 - lib/prisma.ts 说明
**文件：** `docs/Advanced/01-environment-setup/07-creating-project.md`
**位置：** 第279行、第352行
**原文：**
```markdown
`lib/prisma.ts` 文件说明
```
**建议替换为：**
```markdown
`src/db/index.ts` 文件说明（Drizzle 客户端实例）
```

---
**用户评论/编辑区域：**



---

### 修改 1.9 - 文件夹职责表格（已修正）
**文件：** `docs/Advanced/01-environment-setup/07-creating-project.md`
**位置：** 第294行、第301-310行 tip框
**原文：**
```markdown
| prisma/ | 数据库层 |
::: tip prisma/ — 数据库层
- `schema.prisma`：定义数据库模型（表结构）
- `migrations/`：数据库变更历史
```
**建议替换为：**
```markdown
| src/db/ | 数据库层 |
::: tip src/db/ — 数据库层
- `schema.ts`：定义数据库模型（表结构）
- `index.ts`：Drizzle 客户端实例和数据库连接

::: tip drizzle.config.ts — Drizzle Kit 配置
配置 Drizzle Kit 的方言（PostgreSQL）、Schema 路径、数据库连接信息等。
```

---
**用户评论/编辑区域：**



---

### 修改 1.10 - 技术栈选择说明
**文件：** `docs/Advanced/01-environment-setup/07-creating-project.md`
**位置：** 第418行
**原文：**
```markdown
"Next.js + Prisma + Tailwind CSS"
```
**建议替换为：**
```markdown
"Next.js + Drizzle + Tailwind CSS"
```

---
**用户评论/编辑区域：**



---

## 第二章：AI 使用说明书（6处）

### 修改 2.1 - 提示词示例
**文件：** `docs/Advanced/02-ai-tuning-guide/02-vibecoding-workflow.md`
**位置：** 第224行
**原文：**
```markdown
"使用 Next.js 16 App Router，Prisma + PostgreSQL"
```
**建议替换为：**
```markdown
"使用 Next.js 16 App Router，Drizzle ORM + PostgreSQL"
```

---
**用户评论/编辑区域：**



---

### 修改 2.2 - 技术栈列表
**文件：** `docs/Advanced/02-ai-tuning-guide/02-vibecoding-workflow.md`
**位置：** 第251行
**原文：**
```markdown
"- Prisma"
```
**建议替换为：**
```markdown
"- Drizzle ORM"
```

---
**用户评论/编辑区域：**



---

### 修改 2.3 - 项目说明
**文件：** `docs/Advanced/02-ai-tuning-guide/02-vibecoding-workflow.md`
**位置：** 第621行
**原文：**
```markdown
"项目使用 Next.js 16 + TypeScript + Prisma"
```
**建议替换为：**
```markdown
"项目使用 Next.js 16 + TypeScript + Drizzle"
```

---
**用户评论/编辑区域：**



---

### 修改 2.4 - 目录结构
**文件：** `docs/Advanced/02-ai-tuning-guide/02-vibecoding-workflow.md`
**位置：** 第625行
**原文：**
```markdown
"- prisma/: 数据库模型"
```
**建议替换为：**
```markdown
"- src/db/: 数据库模型"
```

---
**用户评论/编辑区域：**



---

### 修改 2.5 - 工作流步骤（已修正）
**文件：** `docs/Advanced/02-ai-tuning-guide/02-vibecoding-workflow.md`
**位置：** 第644-645行、第663行、第679行
**原文：**
```markdown
1. 更新 Prisma schema (添加 Comment 模型)
2. 运行 prisma migrate
```
**建议替换为：**
```markdown
1. 更新 Drizzle schema (添加 Comment 模型)
2. 运行 npx drizzle-kit push
```

---
**用户评论/编辑区域：**



---

### 修改 2.6 - 项目配置示例
**文件：** `docs/Advanced/02-ai-tuning-guide/04-project-config.md`
**位置：** 第190行
**原文：**
```markdown
"- **数据库**: Prisma + PostgreSQL"
```
**建议替换为：**
```markdown
"- **数据库**: Drizzle ORM + PostgreSQL"
```

---
**用户评论/编辑区域：**



---

## 第三章：PRD 与文档驱动开发（1处）

### 修改 3.1 - 技术栈选择
**文件：** `docs/Advanced/03-prd-doc-driven/index.md`
**位置：** 第37行
**原文：**
```markdown
老师傅直接甩给你一份成熟的模板，并拍板决定了 **Next.js 16 全栈**（搭配 **Prisma** 和 **PostgreSQL**）的技术栈。看着你对 **Prisma** 和 **PostgreSQL** 这两个数据库名词一头雾水的样子，老师傅摆摆手打断了你的提问："关于数据怎么存，后面会有专门的章节详细讲，现在别深究。" 他顺带提了一嘴，Prisma 的 `schema` 文件本身就是一份绝佳的数据库结构文档，非常适合在现阶段用来理清数据之间的关系。
```
**建议替换为：**
```markdown
老师傅直接甩给你一份成熟的模板，并拍板决定了 **Next.js 16 全栈**（搭配 **Drizzle ORM** 和 **PostgreSQL**）的技术栈。看着你对 **Drizzle** 和 **PostgreSQL** 这两个数据库名词一头雾水的样子，老师傅摆摆手打断了你的提问："关于数据怎么存，后面会有专门的章节详细讲，现在别深究。" 他顺带提了一嘴，Drizzle 的 Schema 定义文件本身就是一份绝佳的数据库结构文档，非常适合在现阶段用来理清数据之间的关系。
```

---
**用户评论/编辑区域：**



---

## 第四章：代码运行的三种状态与构建原理（1处）

### 修改 4.1 - 依赖说明
**文件：** `docs/Advanced/04-build-and-runtime-modes/index.md`
**位置：** 第35行
**原文：**
```markdown
- **依赖管理**：`dependencies` 列表明确记录了项目运行所必须安装的第三方库（如 React, Next.js, Prisma）
```
**建议替换为：**
```markdown
- **依赖管理**：`dependencies` 列表明确记录了项目运行所必须安装的第三方库（如 React, Next.js, Drizzle）
```

---
**用户评论/编辑区域：**



---

## 第六章：环境变量与安全机制（1处）

### 修改 6.1 - 安全防护说明
**文件：** `docs/Advanced/06-env-vars-security/index.md`
**位置：** 第123行
**原文：**
```markdown
**第二层：应用安全**。随着产品上线，你需要面对更复杂的安全威胁。包括：**SQL注入防护**（使用Prisma ORM自动处理）、XSS攻击防护... 这些威胁听起来可怕，但只要选对技术栈（如Next.js + Prisma），大部分防护都是内置的。
```
**建议替换为：**
```markdown
**第二层：应用安全**。随着产品上线，你需要面对更复杂的安全威胁。包括：**SQL注入防护**（使用 ORM 自动处理，如 Drizzle）、XSS攻击防护... 这些威胁听起来可怕，但只要选对技术栈（如Next.js + Drizzle），大部分防护都是内置的。
```

---
**用户评论/编辑区域：**



---

## 第七章：数据持久化与数据库（4处）- **核心章节**

### 修改 7.1 - 章节目录
**文件：** `docs/Advanced/07-data-persistence-database/index.md`
**位置：** 第24-25行
**原文：**
```markdown
### 7.5 Prisma 入门 (./05-Prisma入门.md)
Prisma ORM 的安装、Schema 定义、迁移管理、Client 初始化。
```
**建议替换为：**
```markdown
### 7.5 Drizzle ORM 入门 (./05-Drizzle入门.md)
Drizzle ORM 的安装、Schema 定义、迁移管理、查询构建。
```

---
**用户评论/编辑区域：**



---

### 修改 7.2 - Schema 标题和说明
**文件：** `docs/Advanced/07-data-persistence-database/index.md`
**位置：** 第80-86行
**原文：**
```markdown
### Prisma Schema

就像你用 JavaScript 指挥浏览器一样，指挥数据库也有专门的语言，叫 **SQL**。但在你不需要专门去学它，因为我们有用来操作数据库的 **Prisma** 组件。你需要理解它的蓝图文件——`schema.prisma`。

你可能会问，这个复杂的文件是谁写的？是你需要背诵语法然后一个字一个字敲出来的吗？当然不是。它是 **AI 从你的 PRD 文档里"悟"出来的**。当你在 PRD 里写下"一个用户可以发布多篇文章"时，AI 读懂了这层业务逻辑，于是它自动在 `User` 表里加上了 `posts` 字段，在 `Post` 表里加上了 `authorId` 字段。**你的工作不是写代码，而是检查 AI 是否正确理解了你的意图。**

老师傅说："你可能以为数据库设计是技术问题，其实是业务理解问题。AI 能懂外键、索引，但'用户和订单是什么关系'需要你理解业务。你的工作不是写 SQL，而是检查 AI 是否正确理解了你的业务。"
```
**建议替换为：**
```markdown
### Drizzle Schema

操作数据库的标准语言是 SQL，在本教程中使用 **Drizzle ORM**。Drizzle 使用 TypeScript 定义 Schema，AI 会根据 PRD 文档自动生成。

比如 PRD 中写明"一个用户可以发布多篇文章"，AI 会自动在 `User` 表添加 `posts` 字段，在 `Post` 表添加 `authorId` 外键。**你的工作是审查 AI 生成的代码是否正确。**

老师傅说："数据库设计的关键是理解业务关系。AI 能处理技术实现，但'用户和订单是什么关系'需要你理解业务。"
```

---
**用户评论/编辑区域：**



---

### 修改 7.3 - Schema 代码示例（已修正，符合官方语法）
**文件：** `docs/Advanced/07-data-persistence-database/index.md`
**位置：** 第88-104行
**原文：**
```markdown
```
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}
```

- **`model`**：这就代表一张**表**。
- **类型**：`Int`（整数）、`String`（文本）、`Boolean`（真假）、`DateTime`（时间）。
- **`?`（问号）**：这是新手的救星。它代表 **Optional（可选）**。
- **`@unique`**：代表这个内容（如邮箱）全表唯一，不能重复注册。
```
**建议替换为：**
```markdown
```typescript
// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),           // 自增主键
  email: text('email').notNull().unique(),  // 必填且唯一
  name: text('name'),                       // 可选字段（不加 .notNull()）
  createdAt: timestamp('created_at').defaultNow(),
})

// 关联表示例
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id').references(() => users.id), // 外键关联
})
```

- **`pgTable`**：定义 PostgreSQL 表结构
- **类型**：`serial`（自增整数）、`text`（文本）、`boolean`（布尔）、`timestamp`（时间）、`integer`（整数）
- **可选字段**：不加 `.notNull()` 的字段默认可选
- **`.unique()`**：字段值唯一
- **`.references()`**：定义表之间的外键关联
```

---
**用户评论/编辑区域：**



---

### 修改 7.4 - generate 命令部分（完全重写）
**文件：** `docs/Advanced/07-data-persistence-database/index.md`
**位置：** 第144-148行
**原文：**
```markdown
**坑二：Schema 与代码不同步（最重要的命令）** 你让 AI 在数据库里增加了一个 `phone` 字段，AI 修改了 `schema.prisma` 文件。但当你运行代码时，程序却炸了，提示"User 上不存在 phone 属性"。你开始怀疑人生，老师傅却淡定地让你运行一句命令：`npx prisma generate`。

原来，Prisma 为了保证 TypeScript 的类型安全，需要根据 Schema 生成一份"类型定义文件"。**每当你修改了数据库结构（Schema），都必须重新运行 generate 命令**，告诉代码："嘿，数据库结构变了，请更新你的认知。"

老师傅特意叮嘱：**这个命令非常重要，以至于在未来你部署上线时的构建命令里，也必须把它加进去**，否则线上的代码会因为不认识新的数据库结构而报错。
```
**建议替换为：**
```markdown
**Drizzle 的优势：无需 generate 步骤**

Drizzle 的 Schema 就是纯 TypeScript 代码，类型定义直接可用。修改 Schema 后不需要运行生成命令，TypeScript 会立即获得正确的类型提示。这简化了开发流程，也避免了"Schema 与代码不同步"这类错误。

部署时也无需额外的构建步骤，直接使用默认的 `next build` 即可。这比 Prisma 的 `npx prisma generate && next build` 更简单。
```

---
**用户评论/编辑区域：**



---

## 第十一章：无服务器部署与 CI/CD 自动化（3处）

### 修改 11.1 - 架构独立性说明
**文件：** `docs/Advanced/11-serverless-deploy-cicd/index.md`
**位置：** 第18行
**原文：**
```markdown
老师傅悄悄提醒你，最好不要被它深度捆绑。意思是：尽量使用 **Prisma** 通过标准的连接字符串去连它，而不是大量使用 Supabase 独有的 JS SDK。这样哪天 Supabase 收费贵了，你可以把 `DATABASE_URL` 一改，无缝迁移到阿里云或其他云数据库，这叫**保持架构的独立性**。
```
**建议替换为：**
```markdown
老师傅悄悄提醒你，最好不要被它深度捆绑。意思是：尽量使用 **Drizzle ORM** 通过标准的连接字符串去连它，而不是大量使用 Supabase 独有的 JS SDK。这样哪天 Supabase 收费贵了，你可以把 `DATABASE_URL` 一改，无缝迁移到阿里云或其他云数据库，这叫**保持架构的独立性**。
```

---
**用户评论/编辑区域：**



---

### 修改 11.2 - Schema 推送命令（已修正）
**文件：** `docs/Advanced/11-serverless-deploy-cicd/index.md`
**位置：** 第46行
**原文：**
```markdown
你恍然大悟：**代码传上去了，但数据库表还没传上去！** Supabase 给你的只是一个**空的数据库**。你本地的表结构（Schema）还在你本地的电脑里。 老师傅教了你一个**远程同步命令**：在本地终端运行： `npx prisma db push` 这会将你本地 `schema.prisma` 定义的结构，推送到线上的 Supabase 数据库中。 （*注意：此时你的本地 `.env` 必须临时指向 Supabase 的地址，或者利用 `--url` 参数指定地址。*）
```
**建议替换为：**
```markdown
你恍然大悟：**代码传上去了，但数据库表还没传上去！** Supabase 给你的只是一个**空的数据库**。你本地的表结构（Schema）还在你本地的电脑里。 老师傅教了你一个**远程同步命令**：在本地终端运行 `npx drizzle-kit push`，这会将你本地 Drizzle Schema 定义的结构，推送到线上的 Supabase 数据库中。（*注意：确保 `drizzle.config.ts` 中的 `DATABASE_URL` 指向 Supabase 地址。*）
```

---
**用户评论/编辑区域：**



---

### 修改 11.3 - Vercel 构建命令（重要）
**文件：** `docs/Advanced/11-serverless-deploy-cicd/index.md`
**位置：** 第48行
**原文：**
```markdown
最后，为了防止上线后报错，老师傅让你检查 Vercel 的 构建命令**Build Command**。虽然默认是 `next build`，但对于 Prisma 项目，最好修改为：`npx prisma generate && next build`。这呼应了第七章的伏笔：**每次构建前，必须先运行 generate**，确保云端的代码能认识最新的数据库结构。
```
**建议替换为：**
```markdown
最后，关于 Vercel 的构建命令：对于 Drizzle ORM 项目，使用默认的 `next build` 即可。Drizzle 不需要额外的生成步骤，这简化了部署流程。
```

---
**用户评论/编辑区域：**



---

## 修改优先级和工作量

### 🔴 高优先级（必须修改）
- 第7章所有4处（核心教学内容）
- 第11章第48行（构建命令，体现 Drizzle 优势）
- 第1章第6、7、9处（项目结构和初始化命令）

### 🟡 中优先级（建议修改）
- 第1章其余7处
- 第2章所有6处（提示词和模板）
- 第3章第37行（技术栈选择）
- 第11章第18行、第46行

### 🟢 低优先级
- 第4章第35行（依赖示例）
- 第6章第123行（安全说明）

---

## 总工作量评估

| 任务类型 | 数量 | 预计时间 |
|---------|------|---------|
| 简单文本替换 | 约15处 | 30分钟 |
| 项目结构调整 | 约3处 | 1小时 |
| 代码示例重写 | 2处 | 1.5小时 |
| 完全重写说明 | 2处 | 1小时 |
| **总计** | **26处** | **4小时** |

---

## Drizzle vs Prisma 关键差异（已验证）

根据官方文档验证的关键点：

1. **无需 generate 步骤**：Drizzle Schema 本身就是 TypeScript
2. **Schema 格式**：从 `.prisma` DSL 改为 TypeScript 代码
3. **项目结构**：从 `prisma/` 文件夹改为 `src/db/` 目录
4. **配置文件**：`drizzle.config.ts`（使用 `defineConfig`）
5. **安装命令**：`pnpm add drizzle-orm pg` 和 `pnpm add -D drizzle-kit`
6. **迁移命令**：从 `prisma migrate` 改为 `drizzle-kit push/migrate`
7. **Studio 命令**：`npx drizzle-kit studio`
8. **构建命令**：从 `npx prisma generate && next build` 简化为 `next build`

---

**文档生成时间：** 2025-01-24
**总计修改点：** 26处
**涉及章节：** 第1、2、3、4、6、7、11章
**验证来源：** Drizzle ORM 官方文档 `/drizzle-team/drizzle-orm-docs`

---

## Sources:
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Commands](https://orm.drizzle.team/docs/kit-overview)
- [Drizzle with PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql)
