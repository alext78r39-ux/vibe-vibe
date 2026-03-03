import { db } from './db/index.js'
import { users, posts, comments, likes, followers, tags, postTags } from './db/schema.js'
import { eq, sql, desc } from 'drizzle-orm'
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

async function advancedDemo() {
  console.log(chalk.bold.magenta('\n  ╔══════════════════════════════════╗'))
  console.log(chalk.bold.magenta('  ║   高级查询演示                   ║'))
  console.log(chalk.bold.magenta('  ╚══════════════════════════════════╝\n'))

  // 1. 子查询：每个用户的帖子数
  section('1. 子查询 — 用户帖子统计')
  const spinner1 = ora('执行子查询...').start()
  const userPostCounts = await db
    .select({
      nickname: users.nickname,
      postCount: sql<number>`(select count(*) from posts where posts.user_id = ${users.id})::int`,
      commentCount: sql<number>`(select count(*) from comments where comments.user_id = ${users.id})::int`,
      likeCount: sql<number>`(select count(*) from likes where likes.user_id = ${users.id})::int`,
    })
    .from(users)
  spinner1.succeed(chalk.green('用户活跃度统计'))
  printTable(
    ['用户', '帖子数', '评论数', '点赞数'],
    userPostCounts.map((u) => [
      chalk.white.bold(u.nickname),
      String(u.postCount),
      String(u.commentCount),
      String(u.likeCount),
    ]),
  )

  // 2. 聚合统计：帖子详情（含点赞数、评论数）
  section('2. 聚合 — 帖子互动统计')
  const spinner2 = ora('聚合查询...').start()
  const postStats = await db
    .select({
      postId: posts.id,
      content: posts.content,
      author: users.nickname,
      likeCount: sql<number>`(select count(*) from likes where likes.post_id = ${posts.id})::int`,
      commentCount: sql<number>`(select count(*) from comments where comments.post_id = ${posts.id})::int`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(sql`(select count(*) from likes where likes.post_id = ${posts.id})`))
  spinner2.succeed(chalk.green('帖子互动排行'))
  printTable(
    ['#', '内容', '作者', '点赞', '评论'],
    postStats.map((p) => [
      String(p.postId),
      p.content.length > 20 ? p.content.slice(0, 20) + '...' : p.content,
      chalk.blue(p.author),
      chalk.red(`♥ ${p.likeCount}`),
      String(p.commentCount),
    ]),
  )

  // 3. 关注网络：互相关注的用户
  section('3. 自连接 — 互相关注（互粉）')
  const spinner3 = ora('查询互粉关系...').start()
  const mutualFollows = await db
    .select({
      user1: sql<string>`u1.nickname`,
      user2: sql<string>`u2.nickname`,
    })
    .from(sql`followers f1`)
    .innerJoin(
      sql`followers f2`,
      sql`f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id`
    )
    .innerJoin(sql`users u1`, sql`f1.follower_id = u1.id`)
    .innerJoin(sql`users u2`, sql`f1.following_id = u2.id`)
    .where(sql`f1.follower_id < f1.following_id`)
  spinner3.succeed(chalk.green(`找到 ${mutualFollows.length} 对互粉`))
  printTable(
    ['用户 A', '↔', '用户 B'],
    mutualFollows.map((m) => [chalk.blue(m.user1), '互相关注', chalk.blue(m.user2)]),
  )

  // 4. 多对多：帖子标签
  section('4. 多对多 — 帖子标签')
  const spinner4 = ora('查询帖子标签...').start()
  const postTagList = await db
    .select({
      postId: posts.id,
      content: posts.content,
      tag: tags.name,
    })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .orderBy(posts.id)
  spinner4.succeed(chalk.green('帖子标签关联'))

  // 按帖子分组显示
  const grouped = new Map<number, { content: string; tags: string[] }>()
  for (const row of postTagList) {
    const existing = grouped.get(row.postId)
    if (existing) {
      existing.tags.push(row.tag)
    } else {
      grouped.set(row.postId, { content: row.content, tags: [row.tag] })
    }
  }
  printTable(
    ['帖子 ID', '内容', '标签'],
    [...grouped.entries()].map(([id, data]) => [
      String(id),
      data.content.length > 20 ? data.content.slice(0, 20) + '...' : data.content,
      data.tags.map((t) => chalk.magenta(`#${t}`)).join(' '),
    ]),
  )

  // 5. 粉丝排行
  section('5. 聚合排行 — 粉丝数 TOP')
  const spinner5 = ora('统计粉丝数...').start()
  const followerCounts = await db
    .select({
      nickname: users.nickname,
      followerCount: sql<number>`(select count(*) from followers where following_id = ${users.id})::int`,
      followingCount: sql<number>`(select count(*) from followers where follower_id = ${users.id})::int`,
    })
    .from(users)
    .orderBy(desc(sql`(select count(*) from followers where following_id = ${users.id})`))
  spinner5.succeed(chalk.green('粉丝排行'))
  printTable(
    ['用户', '粉丝数', '关注数'],
    followerCounts.map((u) => [
      chalk.white.bold(u.nickname),
      chalk.green(String(u.followerCount)),
      String(u.followingCount),
    ]),
  )

  console.log(chalk.bold.green('\n  ✅ 高级查询演示完成！\n'))
}

advancedDemo().catch(console.error)
