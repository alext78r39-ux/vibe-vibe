import { z } from 'zod'

const demoNames = ['users', 'posts', 'likes', 'followers', 'tags', 'update', 'comments', 'validation'] as const

const cliArgsSchema = z.object({
  all: z.boolean(),
  demo: z.enum(demoNames).optional(),
  verbose: z.boolean(),
  help: z.boolean(),
})

export type CliArgs = z.infer<typeof cliArgsSchema>

export function parseArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  const raw: Record<string, unknown> = {
    all: false,
    verbose: false,
    help: false,
  }

  for (const arg of argv) {
    if (arg === '--all' || arg === '-a') {
      raw.all = true
    } else if (arg === '--verbose' || arg === '-v') {
      raw.verbose = true
    } else if (arg === '--help' || arg === '-h') {
      raw.help = true
    } else if (arg.startsWith('--demo=')) {
      raw.demo = arg.split('=')[1]
    } else {
      console.error(`未知参数: ${arg}`)
      console.error('使用 --help 查看帮助')
      process.exit(1)
    }
  }

  const result = cliArgsSchema.safeParse(raw)
  if (!result.success) {
    console.error('参数验证失败:')
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }

  return result.data
}

export function printHelp() {
  console.log(`
用法: tsx src/operations.ts [选项]

选项:
  --all, -a           运行全部演示
  --demo=<name>       运行指定演示 (${demoNames.join(', ')})
  --verbose, -v       显示详细输出
  --help, -h          显示帮助信息

示例:
  tsx src/operations.ts --all
  tsx src/operations.ts --demo=users
  tsx src/operations.ts              # 交互式菜单
`)
}
