import { db } from './db/index.js'
import { posts, users } from './db/schema.js'
import { eq, gt, sql, desc, asc } from 'drizzle-orm'
import chalk from 'chalk'
import ora from 'ora'
import { section, printTable, banner, printSQL, timed, formatElapsed, printComparison } from './cli-utils.js'

async function paginationDemo() {
  banner('分页策略对比演示')

  const PAGE_SIZE = 2

  // 1. Offset 分页
  section('1. Offset 分页（传统方式）')
  printSQL('SQL', 'SELECT * FROM posts ORDER BY id LIMIT 2 OFFSET 0')
  console.log(chalk.dim('  优点：简单直观，支持跳页'))
  console.log(chalk.dim('  缺点：大偏移量时性能差，数据变动时可能重复/遗漏\n'))

  const offsetTimes: number[] = []
  for (let page = 0; page < 2; page++) {
    const spinner = ora(`Offset 分页 — 第 ${page + 1} 页...`).start()
    const [result, elapsed] = await timed(() => db
      .select({ id: posts.id, content: posts.content, author: users.nickname })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(asc(posts.id))
      .limit(PAGE_SIZE)
      .offset(page * PAGE_SIZE)
    )
    offsetTimes.push(elapsed)
    spinner.succeed(chalk.green(`第 ${page + 1} 页 (${result.length} 条, ${formatElapsed(elapsed)})`))

    printTable(
      ['ID', '内容', '作者'],
      result.map((r) => [
        String(r.id),
        r.content.length > 25 ? r.content.slice(0, 25) + '...' : r.content,
        chalk.blue(r.author),
      ]),
    )
  }

  // 2. Cursor 分页
  section('2. Cursor 分页（推荐方式）')
  printSQL('SQL', 'SELECT * FROM posts WHERE id > cursor ORDER BY id LIMIT 2')
  console.log(chalk.dim('  优点：性能稳定，不受数据变动影响'))
  console.log(chalk.dim('  缺点：不支持跳页，只能前进/后退\n'))

  const cursorTimes: number[] = []
  let cursor: number | null = null
  for (let page = 0; page < 2; page++) {
    const spinner = ora(`Cursor 分页 — 第 ${page + 1} 页 (cursor=${cursor ?? 'null'})...`).start()

    const cursorVal: number | null = cursor
    const [result, elapsed] = await timed(async (): Promise<{ id: number; content: string; author: string }[]> => {
      const query = db
        .select({ id: posts.id, content: posts.content, author: users.nickname })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .orderBy(asc(posts.id))
        .limit(PAGE_SIZE + 1)

      return cursorVal
        ? await query.where(gt(posts.id, cursorVal))
        : await query
    })

    cursorTimes.push(elapsed)
    const hasMore = result.length > PAGE_SIZE
    if (hasMore) result.pop()
    cursor = result.length > 0 ? result[result.length - 1].id : null

    spinner.succeed(chalk.green(`第 ${page + 1} 页 (${result.length} 条, ${formatElapsed(elapsed)}, hasMore=${hasMore})`))

    printTable(
      ['ID', '内容', '作者'],
      result.map((r) => [
        String(r.id),
        r.content.length > 25 ? r.content.slice(0, 25) + '...' : r.content,
        chalk.blue(r.author),
      ]),
    )
  }

  // 对比总结
  section('3. 对比总结')

  // Timing comparison
  const avgOffset = offsetTimes.reduce((a, b) => a + b, 0) / offsetTimes.length
  const avgCursor = cursorTimes.reduce((a, b) => a + b, 0) / cursorTimes.length
  console.log(chalk.dim(`  平均耗时: Offset ${formatElapsed(avgOffset)} vs Cursor ${formatElapsed(avgCursor)}\n`))

  printComparison(
    ['特性', 'Offset 分页', 'Cursor 分页'],
    [
      ['实现复杂度', chalk.green('简单'), chalk.yellow('中等')],
      ['大数据性能', chalk.red('差（全表扫描）'), chalk.green('好（索引查找）')],
      ['跳页支持', chalk.green('支持'), chalk.red('不支持')],
      ['数据一致性', chalk.red('可能重复/遗漏'), chalk.green('稳定')],
      ['适用场景', '后台管理、小数据集', '信息流、无限滚动'],
    ],
  )

  console.log(chalk.bold.green('\n  ✅ 分页对比演示完成！\n'))
}

paginationDemo().catch(console.error)
