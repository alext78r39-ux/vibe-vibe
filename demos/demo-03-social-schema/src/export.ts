import { db } from './db/index.js'
import { users, posts, comments, likes, followers, tags, postTags } from './db/schema.js'
import { eq, sql } from 'drizzle-orm'
import chalk from 'chalk'
import ora from 'ora'
import { writeFileSync } from 'fs'

async function exportData() {
  console.log(chalk.bold.magenta('\n  ╔══════════════════════════════════╗'))
  console.log(chalk.bold.magenta('  ║   数据导出演示                   ║'))
  console.log(chalk.bold.magenta('  ╚══════════════════════════════════╝\n'))

  // 1. 导出 JSON
  const spinner1 = ora('导出 JSON...').start()
  const allUsers = await db.select().from(users)
  const allPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      author: users.nickname,
      images: posts.images,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))

  const allComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      content: comments.content,
      user: users.nickname,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))

  const jsonData = {
    exportedAt: new Date().toISOString(),
    users: allUsers,
    posts: allPosts,
    comments: allComments,
  }

  writeFileSync('export.json', JSON.stringify(jsonData, null, 2), 'utf-8')
  spinner1.succeed(chalk.green(`JSON 导出完成 → export.json (${allUsers.length} 用户, ${allPosts.length} 帖子, ${allComments.length} 评论)`))

  // 2. 导出 CSV
  const spinner2 = ora('导出 CSV...').start()

  // 用户 CSV
  const userCsv = [
    'id,nickname,avatar,created_at',
    ...allUsers.map((u) =>
      `${u.id},"${u.nickname}","${u.avatar ?? ''}","${u.createdAt?.toISOString() ?? ''}"`
    ),
  ].join('\n')
  writeFileSync('export-users.csv', userCsv, 'utf-8')

  // 帖子 CSV
  const postCsv = [
    'id,content,author,created_at',
    ...allPosts.map((p) =>
      `${p.id},"${p.content.replace(/"/g, '""')}","${p.author}","${p.createdAt?.toISOString() ?? ''}"`
    ),
  ].join('\n')
  writeFileSync('export-posts.csv', postCsv, 'utf-8')

  spinner2.succeed(chalk.green('CSV 导出完成 → export-users.csv, export-posts.csv'))

  // 3. 统计摘要
  const spinner3 = ora('生成统计摘要...').start()
  const [stats] = await db
    .select({
      userCount: sql<number>`(select count(*) from users)::int`,
      postCount: sql<number>`(select count(*) from posts)::int`,
      commentCount: sql<number>`(select count(*) from comments)::int`,
      likeCount: sql<number>`(select count(*) from likes)::int`,
      followerCount: sql<number>`(select count(*) from followers)::int`,
      tagCount: sql<number>`(select count(*) from tags)::int`,
    })
    .from(sql`(select 1) as dummy`)

  const summary = [
    `# 数据统计摘要`,
    `导出时间: ${new Date().toLocaleString('zh-CN')}`,
    ``,
    `| 表 | 记录数 |`,
    `|---|---|`,
    `| 用户 | ${stats.userCount} |`,
    `| 帖子 | ${stats.postCount} |`,
    `| 评论 | ${stats.commentCount} |`,
    `| 点赞 | ${stats.likeCount} |`,
    `| 关注 | ${stats.followerCount} |`,
    `| 标签 | ${stats.tagCount} |`,
  ].join('\n')
  writeFileSync('export-summary.md', summary, 'utf-8')
  spinner3.succeed(chalk.green('统计摘要 → export-summary.md'))

  console.log(chalk.bold.green('\n  ✅ 数据导出完成！\n'))
  console.log(chalk.dim('  生成文件:'))
  console.log(chalk.dim('    - export.json        (完整 JSON)'))
  console.log(chalk.dim('    - export-users.csv   (用户 CSV)'))
  console.log(chalk.dim('    - export-posts.csv   (帖子 CSV)'))
  console.log(chalk.dim('    - export-summary.md  (统计摘要)\n'))
}

exportData().catch(console.error)
