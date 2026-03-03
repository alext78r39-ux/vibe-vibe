import { db } from './db/index.js'
import { users, posts, comments, likes, followers, tags, postTags } from './db/schema.js'
import { insertUserSchema, insertPostSchema } from './validation.js'
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

async function seed() {
  console.log(chalk.bold('\n  🌱 Social Schema — 数据填充\n'))

  const spinner = ora('插入用户...').start()

  // drizzle-zod 验证：插入前校验数据
  const userData = [
    { nickname: '小红', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { nickname: '小明', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { nickname: '小芳', avatar: 'https://i.pravatar.cc/150?u=charlie' },
  ]
  for (const u of userData) {
    try {
      insertUserSchema.parse(u)
    } catch (err) {
      spinner.fail(chalk.red(`用户数据验证失败: ${u.nickname}`))
      throw err
    }
  }

  const [alice, bob, charlie] = await db
    .insert(users)
    .values(userData)
    .returning()
  spinner.succeed(chalk.green(`用户创建完成: ${alice.nickname}, ${bob.nickname}, ${charlie.nickname}`))

  const spinner2 = ora('插入帖子...').start()
  const postData = [
    { userId: alice.id, content: '今天天气真好，出去拍了好多照片！📸', images: ['sunset.jpg', 'park.jpg'] },
    { userId: bob.id, content: '分享一个超好吃的蛋糕店 🍰 地址在南京路 88 号', images: ['cake.jpg'] },
    { userId: charlie.id, content: '周末读了一本好书，推荐给大家 📚', images: ['book.jpg'] },
  ]
  for (const p of postData) {
    insertPostSchema.parse(p)
  }
  const [post1, post2, post3] = await db
    .insert(posts)
    .values(postData)
    .returning()
  spinner2.succeed(chalk.green(`帖子创建完成: #${post1.id}, #${post2.id}, #${post3.id}`))

  const spinner3 = ora('插入评论...').start()
  await db.insert(comments).values([
    { postId: post1.id, userId: bob.id, content: '照片好好看！在哪里拍的？' },
    { postId: post1.id, userId: charlie.id, content: '天气确实不错～' },
    { postId: post2.id, userId: alice.id, content: '在哪里？我也想去！' },
    { postId: post2.id, userId: charlie.id, content: '看起来好好吃' },
    { postId: post3.id, userId: alice.id, content: '什么书？求推荐！' },
  ])
  spinner3.succeed(chalk.green('5 条评论已插入'))

  const spinner4 = ora('插入点赞...').start()
  await db.insert(likes).values([
    { postId: post1.id, userId: bob.id },
    { postId: post1.id, userId: charlie.id },
    { postId: post2.id, userId: alice.id },
    { postId: post2.id, userId: charlie.id },
    { postId: post3.id, userId: alice.id },
    { postId: post3.id, userId: bob.id },
  ])
  spinner4.succeed(chalk.green('6 个点赞已插入'))

  // 关注关系
  const spinner5 = ora('插入关注关系...').start()
  await db.insert(followers).values([
    { followerId: alice.id, followingId: bob.id },
    { followerId: alice.id, followingId: charlie.id },
    { followerId: bob.id, followingId: alice.id },
    { followerId: charlie.id, followingId: alice.id },
    { followerId: charlie.id, followingId: bob.id },
  ])
  spinner5.succeed(chalk.green('5 条关注关系已插入'))

  // 标签
  const spinner6 = ora('插入标签...').start()
  const [tagPhoto, tagFood, tagBook, tagLife] = await db
    .insert(tags)
    .values([
      { name: '摄影' },
      { name: '美食' },
      { name: '读书' },
      { name: '生活' },
    ])
    .returning()
  spinner6.succeed(chalk.green(`4 个标签已创建`))

  // 帖子-标签关联
  const spinner7 = ora('关联帖子标签...').start()
  await db.insert(postTags).values([
    { postId: post1.id, tagId: tagPhoto.id },
    { postId: post1.id, tagId: tagLife.id },
    { postId: post2.id, tagId: tagFood.id },
    { postId: post2.id, tagId: tagLife.id },
    { postId: post3.id, tagId: tagBook.id },
  ])
  spinner7.succeed(chalk.green('5 条帖子-标签关联已插入'))

  console.log()
  printTable(
    ['ID', '昵称', '头像'],
    [alice, bob, charlie].map((u) => [String(u.id), u.nickname, u.avatar ?? '-']),
  )

  console.log(chalk.bold.green('\n  ✅ 示例数据填充完成！\n'))
  console.log(chalk.dim('  运行 pnpm demo 查看 CRUD 操作演示'))
  console.log(chalk.dim('  运行 pnpm transactions 查看事务演示'))
  console.log(chalk.dim('  运行 pnpm pagination 查看分页对比'))
  console.log(chalk.dim('  运行 pnpm advanced 查看高级查询'))
  console.log(chalk.dim('  运行 pnpm export 导出数据\n'))
}

seed().catch(console.error)
