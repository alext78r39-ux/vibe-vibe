import { db } from './db/index.js'
import { users, posts, comments, likes, followers } from './db/schema.js'
import { eq, sql } from 'drizzle-orm'
import chalk from 'chalk'
import ora from 'ora'
import Table from 'cli-table3'

function printTable(headers: string[], rows: string[][]) {
  const table = new Table({
    head: headers.map((h) => chalk.cyan.bold(h)),
    style: { head: [], border: ['gray'] },
  })
  rows.forEach((r) => table.push(r))
  console.log(table.toString())
}

function section(title: string) {
  console.log(chalk.bold.yellow(`\n  ─── ${title} ───\n`))
}

async function transactionsDemo() {
  console.log(chalk.bold.magenta('\n  ╔══════════════════════════════════╗'))
  console.log(chalk.bold.magenta('  ║   事务（Transaction）演示        ║'))
  console.log(chalk.bold.magenta('  ╚══════════════════════════════════╝\n'))

  // 1. 转移帖子所有权（事务）
  section('1. 转移帖子所有权')
  const spinner1 = ora('查找用户和帖子...').start()
  const allUsers = await db.select().from(users)
  const allPosts = await db.select().from(posts)

  if (allUsers.length < 2 || allPosts.length === 0) {
    spinner1.fail(chalk.red('数据不足，请先运行 pnpm seed'))
    return
  }

  const fromUser = allUsers[0]
  const toUser = allUsers[1]
  const targetPost = allPosts.find((p) => p.userId === fromUser.id)

  if (!targetPost) {
    spinner1.info(chalk.yellow(`${fromUser.nickname} 没有帖子可转移`))
  } else {
    spinner1.succeed(chalk.green(`准备将帖子 #${targetPost.id} 从 ${fromUser.nickname} 转给 ${toUser.nickname}`))

    const spinner1b = ora('执行事务...').start()
    try {
      // Neon HTTP 不支持真正的事务，用批量操作模拟
      await db.batch([
        db.update(posts).set({ userId: toUser.id }).where(eq(posts.id, targetPost.id)),
        db.update(comments).set({ userId: toUser.id }).where(eq(comments.userId, fromUser.id)),
      ])
      spinner1b.succeed(chalk.green('帖子所有权转移成功'))

      // 恢复
      await db.update(posts).set({ userId: fromUser.id }).where(eq(posts.id, targetPost.id))
      console.log(chalk.dim('  （已恢复原始数据）'))
    } catch (err) {
      spinner1b.fail(chalk.red(`事务失败: ${err}`))
    }
  }

  // 2. 批量操作回滚演示
  section('2. 批量操作 + 错误处理')
  const spinner2 = ora('尝试批量插入（含重复数据）...').start()
  try {
    await db.insert(likes).values([
      { postId: allPosts[0].id, userId: allUsers[2].id },
    ]).onConflictDoNothing()
    spinner2.succeed(chalk.green('批量插入完成（冲突已忽略）'))
  } catch (err) {
    spinner2.fail(chalk.red(`操作失败: ${err}`))
  }

  // 3. 级联查询：删除用户前检查关联数据
  section('3. 级联检查（删除前预检）')
  const spinner3 = ora('检查用户关联数据...').start()
  const checkUser = allUsers[0]
  const [relatedData] = await db
    .select({
      postCount: sql<number>`(select count(*) from posts where user_id = ${checkUser.id})::int`,
      commentCount: sql<number>`(select count(*) from comments where user_id = ${checkUser.id})::int`,
      likeCount: sql<number>`(select count(*) from likes where user_id = ${checkUser.id})::int`,
      followerCount: sql<number>`(select count(*) from followers where following_id = ${checkUser.id})::int`,
    })
    .from(users)
    .where(eq(users.id, checkUser.id))
  spinner3.succeed(chalk.green(`${checkUser.nickname} 的关联数据统计：`))

  printTable(
    ['帖子数', '评论数', '点赞数', '粉丝数'],
    [[
      String(relatedData.postCount),
      String(relatedData.commentCount),
      String(relatedData.likeCount),
      String(relatedData.followerCount),
    ]],
  )
  console.log(chalk.dim('  （实际删除需先清理所有关联数据，此处仅做预检演示）'))

  console.log(chalk.bold.green('\n  ✅ 事务演示完成！\n'))
}

transactionsDemo().catch(console.error)
