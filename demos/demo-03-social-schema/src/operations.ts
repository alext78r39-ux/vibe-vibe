import { db } from './db/index.js'
import { users, posts, comments, likes, followers, tags, postTags } from './db/schema.js'
import { eq, sql, desc } from 'drizzle-orm'
import chalk from 'chalk'
import ora from 'ora'
import { select, confirm } from '@inquirer/prompts'
import { section, printTable, banner, printSQL, timed, formatElapsed } from './cli-utils.js'
import { runValidation } from './validated-operations.js'
import { parseArgs, printHelp } from './cli-args.js'

// 各演示函数
async function demoSelectUsers() {
  section('SELECT — 查询所有用户')
  printSQL('SQL', 'SELECT * FROM users')
  const spinner = ora('查询用户表...').start()
  const [allUsers, elapsed] = await timed(() => db.select().from(users))
  spinner.succeed(chalk.green(`找到 ${allUsers.length} 个用户`) + chalk.dim(` (${formatElapsed(elapsed)})`))
  printTable(
    ['ID', '昵称', '头像', '创建时间'],
    allUsers.map((u) => [
      String(u.id),
      chalk.white.bold(u.nickname),
      chalk.dim(u.avatar ?? '-'),
      u.createdAt?.toLocaleString('zh-CN') ?? '-',
    ]),
  )
}

async function demoJoinPosts() {
  section('JOIN — 帖子列表（含作者）')
  printSQL('SQL', 'SELECT posts.id, posts.content, users.nickname FROM posts INNER JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC')
  const spinner = ora('联表查询...').start()
  const [postsWithAuthor, elapsed] = await timed(() => db
    .select({
      postId: posts.id,
      content: posts.content,
      author: users.nickname,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
  )
  spinner.succeed(chalk.green(`找到 ${postsWithAuthor.length} 篇帖子`) + chalk.dim(` (${formatElapsed(elapsed)})`))
  printTable(
    ['#', '内容', '作者', '时间'],
    postsWithAuthor.map((p) => [
      String(p.postId),
      p.content.length > 30 ? p.content.slice(0, 30) + '...' : p.content,
      chalk.blue(p.author),
      p.createdAt?.toLocaleString('zh-CN') ?? '-',
    ]),
  )
}

async function demoLikeStats() {
  section('GROUP BY — 帖子点赞统计')
  const spinner = ora('聚合查询...').start()
  const likeCounts = await db
    .select({
      postId: likes.postId,
      count: sql<number>`count(*)`.as('like_count'),
    })
    .from(likes)
    .groupBy(likes.postId)
  spinner.succeed(chalk.green('统计完成'))
  printTable(
    ['帖子 ID', '点赞数'],
    likeCounts.map((l) => [
      String(l.postId),
      chalk.red('♥ '.repeat(Number(l.count))) + ` (${l.count})`,
    ]),
  )
}

async function demoFollowers() {
  section('关注关系')
  const spinner = ora('查询关注网络...').start()
  const followList = await db
    .select({
      follower: sql<string>`(select nickname from users where id = ${followers.followerId})`,
      following: sql<string>`(select nickname from users where id = ${followers.followingId})`,
    })
    .from(followers)
  spinner.succeed(chalk.green(`${followList.length} 条关注关系`))
  printTable(
    ['关注者', '→', '被关注者'],
    followList.map((f) => [chalk.blue(f.follower), '关注了', chalk.green(f.following)]),
  )
}

async function demoTags() {
  section('标签系统')
  const spinner = ora('查询标签...').start()
  const tagList = await db
    .select({
      tag: tags.name,
      postCount: sql<number>`(select count(*) from post_tags where tag_id = ${tags.id})::int`,
    })
    .from(tags)
  spinner.succeed(chalk.green(`${tagList.length} 个标签`))
  printTable(
    ['标签', '帖子数'],
    tagList.map((t) => [chalk.magenta(`#${t.tag}`), String(t.postCount)]),
  )
}

async function demoUpdateNickname() {
  section('UPDATE — 更新用户昵称')
  const confirmed = await confirm({ message: '确认将「小红」更名为「小红薯」？' })
  if (!confirmed) {
    console.log(chalk.dim('  已取消'))
    return
  }
  const spinner = ora('更新中...').start()
  const updated = await db
    .update(users)
    .set({ nickname: '小红薯' })
    .where(eq(users.nickname, '小红'))
    .returning()
  if (updated.length > 0) {
    spinner.succeed(chalk.green(`小红 → ${chalk.bold(updated[0].nickname)}`))
  } else {
    spinner.info(chalk.yellow('未找到"小红"（可能已更新过）'))
  }
}

async function demoComments() {
  section('JOIN — 帖子评论详情')
  const spinner = ora('查询评论...').start()
  const commentsWithUser = await db
    .select({
      postId: comments.postId,
      comment: comments.content,
      user: users.nickname,
      time: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .orderBy(comments.postId)
  spinner.succeed(chalk.green(`找到 ${commentsWithUser.length} 条评论`))
  printTable(
    ['帖子', '评论', '用户', '时间'],
    commentsWithUser.map((c) => [
      `#${c.postId}`,
      c.comment,
      chalk.blue(c.user),
      c.time?.toLocaleString('zh-CN') ?? '-',
    ]),
  )
}

const MENU = [
  { key: 'users', label: '查询所有用户', fn: demoSelectUsers },
  { key: 'posts', label: '帖子列表（JOIN）', fn: demoJoinPosts },
  { key: 'likes', label: '点赞统计（GROUP BY）', fn: demoLikeStats },
  { key: 'followers', label: '关注关系', fn: demoFollowers },
  { key: 'tags', label: '标签系统', fn: demoTags },
  { key: 'update', label: '更新昵称（UPDATE）', fn: demoUpdateNickname },
  { key: 'comments', label: '评论详情（JOIN）', fn: demoComments },
  { key: 'validation', label: '验证演示（drizzle-zod）', fn: runValidation },
] as const

async function runAll() {
  for (const item of MENU) {
    await item.fn()
  }
}

async function main() {
  banner('Drizzle ORM 操作演示')

  const args = parseArgs()

  if (args.help) {
    printHelp()
    return
  }

  // 非交互模式：--all
  if (args.all) {
    await runAll()
    return
  }

  // 非交互模式：--demo=xxx
  if (args.demo) {
    const item = MENU.find((m) => m.key === args.demo)
    if (item) {
      await item.fn()
    } else {
      console.log(chalk.red(`  未知演示: ${args.demo}`))
    }
    return
  }

  // 交互式菜单（@inquirer/prompts）
  while (true) {
    const choice = await select({
      message: '选择要运行的演示',
      choices: [
        ...MENU.map((m) => ({ name: m.label, value: m.key })),
        { name: '运行全部', value: 'all' },
        { name: '退出', value: 'quit' },
      ],
    })

    if (choice === 'quit') {
      console.log(chalk.dim('\n  再见！\n'))
      break
    }

    if (choice === 'all') {
      await runAll()
      continue
    }

    const selected = MENU.find((m) => m.key === choice)
    if (selected) {
      await selected.fn()
    }
  }
}

main().catch(console.error)
