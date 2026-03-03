import chalk from 'chalk'
import { insertUserSchema, insertPostSchema, insertCommentSchema } from './validation.js'

function section(title: string) {
  console.log(chalk.bold.yellow(`\n  ─── ${title} ───\n`))
}

function showResult(label: string, success: boolean, detail: string) {
  const icon = success ? chalk.green('✓') : chalk.red('✗')
  console.log(`  ${icon} ${label}`)
  console.log(chalk.dim(`    ${detail}\n`))
}

export async function runValidation() {
  console.log(chalk.bold.magenta('\n  ╔══════════════════════════════════════════════════╗'))
  console.log(chalk.bold.magenta('  ║   drizzle-zod 验证演示 — Schema 驱动的类型安全   ║'))
  console.log(chalk.bold.magenta('  ╚══════════════════════════════════════════════════╝\n'))

  // ── 教学说明 ──
  console.log(chalk.cyan.bold('  📖 这是什么？'))
  console.log(chalk.cyan('  drizzle-zod 从你的数据库 Schema（Drizzle ORM）自动生成'))
  console.log(chalk.cyan('  Zod 验证规则。一份 Schema 同时用于：'))
  console.log(chalk.cyan('    • 数据库建表（DDL）'))
  console.log(chalk.cyan('    • TypeScript 类型推导'))
  console.log(chalk.cyan('    • 运行时数据验证'))
  console.log(chalk.dim('  这就是 "单一数据源 (Single Source of Truth)" 模式。\n'))

  section('1. 用户数据验证 — insertUserSchema')
  console.log(chalk.dim('  库: drizzle-zod · createInsertSchema()'))
  console.log(chalk.dim('  原理: 从 users 表的列定义自动推导出 zod schema，'))
  console.log(chalk.dim('  再叠加自定义规则（如 nickname 最少 1 字）\n'))

  const validUser = { nickname: '小红', avatar: 'https://i.pravatar.cc/150?u=alice' }
  const userResult = insertUserSchema.safeParse(validUser)
  showResult(
    '合法用户数据',
    userResult.success,
    userResult.success ? `通过: ${JSON.stringify(userResult.data)}` : '失败',
  )

  const invalidUser = { nickname: '', avatar: 'test.jpg' }
  const invalidUserResult = insertUserSchema.safeParse(invalidUser)
  showResult(
    '非法用户数据（空昵称）',
    invalidUserResult.success,
    invalidUserResult.success
      ? '意外通过'
      : `拒绝: ${invalidUserResult.error.issues.map((i) => i.message).join(', ')}`,
  )

  section('2. 帖子数据验证 — insertPostSchema')
  console.log(chalk.dim('  库: drizzle-zod · createInsertSchema()'))
  console.log(chalk.dim('  原理: content 列为 text NOT NULL，自动生成 z.string().min(1)'))
  console.log(chalk.dim('  images 列为 json，自动生成 z.unknown()，可叠加自定义\n'))

  const validPost = { userId: 1, content: '今天天气真好！', images: ['photo.jpg'] }
  const postResult = insertPostSchema.safeParse(validPost)
  showResult(
    '合法帖子数据',
    postResult.success,
    postResult.success ? `通过: content="${postResult.data.content}"` : '失败',
  )

  const invalidPost = { userId: 1, content: '' }
  const invalidPostResult = insertPostSchema.safeParse(invalidPost)
  showResult(
    '非法帖子数据（空内容）',
    invalidPostResult.success,
    invalidPostResult.success
      ? '意外通过'
      : `拒绝: ${invalidPostResult.error.issues.map((i) => i.message).join(', ')}`,
  )

  section('3. 评论数据验证 — insertCommentSchema')
  console.log(chalk.dim('  库: drizzle-zod · createInsertSchema()'))
  console.log(chalk.dim('  原理: 叠加 .max(500) 限制评论长度，safeParse 不抛异常，'))
  console.log(chalk.dim('  返回 { success, data?, error? } 便于程序处理\n'))

  const validComment = { postId: 1, userId: 2, content: '写得好！' }
  const commentResult = insertCommentSchema.safeParse(validComment)
  showResult(
    '合法评论数据',
    commentResult.success,
    commentResult.success ? `通过: "${commentResult.data.content}"` : '失败',
  )

  const longComment = { postId: 1, userId: 2, content: '哈'.repeat(501) }
  const longResult = insertCommentSchema.safeParse(longComment)
  showResult(
    '非法评论数据（超过 500 字）',
    longResult.success,
    longResult.success
      ? '意外通过'
      : `拒绝: ${longResult.error.issues.map((i) => i.message).join(', ')}`,
  )

  // ── 教学总结 ──
  console.log(chalk.bold.green('  ╔══════════════════════════════════════════════════╗'))
  console.log(chalk.bold.green('  ║                  验证演示完成                     ║'))
  console.log(chalk.bold.green('  ╚══════════════════════════════════════════════════╝\n'))
  console.log(chalk.yellow.bold('  📝 学到了什么？'))
  console.log(chalk.yellow('  1. createInsertSchema() — 从 Drizzle 表定义生成 Zod schema'))
  console.log(chalk.yellow('  2. .safeParse()         — 不抛异常的验证，返回结构化结果'))
  console.log(chalk.yellow('  3. 自定义 refinement    — 在自动生成的基础上叠加业务规则'))
  console.log(chalk.yellow('  4. DRY 原则             — 数据库 + 类型 + 验证共用一份定义\n'))
  console.log(chalk.dim('  试一试: 修改 src/validation.ts 中的规则，再运行 pnpm validate'))
  console.log(chalk.dim('  观察验证结果如何变化。\n'))
}

// 直接运行
if (process.argv[1]?.endsWith('validated-operations.ts') || process.argv[1]?.endsWith('validated-operations.js')) {
  runValidation().catch(console.error)
}
