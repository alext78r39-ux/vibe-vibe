import chalk from 'chalk'
import Table from 'cli-table3'

/** Print a styled section header */
export function section(title: string) {
  console.log(chalk.bold.yellow(`\n  ─── ${title} ───\n`))
}

/** Print a formatted table */
export function printTable(headers: string[], rows: string[][]) {
  const table = new Table({
    head: headers.map((h) => chalk.cyan.bold(h)),
    style: { head: [], border: ['gray'] },
  })
  rows.forEach((r) => table.push(r))
  console.log(table.toString())
}

/** Print a banner box */
export function banner(title: string) {
  const padded = title.padEnd(34)
  console.log(chalk.bold.magenta(`\n  ╔${'═'.repeat(36)}╗`))
  console.log(chalk.bold.magenta(`  ║ ${padded} ║`))
  console.log(chalk.bold.magenta(`  ╚${'═'.repeat(36)}╝`))
  console.log(chalk.dim(`  CLI 库: chalk · cli-table3 · ora · @inquirer/prompts · zod\n`))
}

/** Highlight SQL keywords in a string */
export function highlightSQL(sql: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'ON', 'ORDER BY', 'GROUP BY', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'SET', 'DELETE', 'RETURNING', 'AS', 'COUNT', 'AND', 'OR', 'IN', 'NOT', 'NULL', 'ASC', 'DESC']
  let result = sql
  for (const kw of keywords) {
    result = result.replace(
      new RegExp(`\\b${kw}\\b`, 'gi'),
      chalk.blue.bold(kw.toUpperCase())
    )
  }
  // Highlight strings
  result = result.replace(/'[^']*'/g, (m) => chalk.green(m))
  // Highlight numbers
  result = result.replace(/\b\d+\b/g, (m) => chalk.yellow(m))
  return result
}

/** Print a SQL statement with syntax highlighting */
export function printSQL(label: string, sql: string) {
  console.log(chalk.dim(`  ${label}: `) + highlightSQL(sql))
}

/** Format elapsed time */
export function formatElapsed(ms: number): string {
  if (ms < 1) return chalk.green(`${(ms * 1000).toFixed(0)}μs`)
  if (ms < 100) return chalk.green(`${ms.toFixed(1)}ms`)
  if (ms < 1000) return chalk.yellow(`${ms.toFixed(0)}ms`)
  return chalk.red(`${(ms / 1000).toFixed(2)}s`)
}

/** Time an async operation and return [result, elapsedMs] */
export async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now()
  const result = await fn()
  return [result, performance.now() - start]
}

/** Print a comparison table between two approaches */
export function printComparison(
  headers: [string, string, string],
  rows: [string, string, string][]
) {
  const table = new Table({
    head: headers.map((h) => chalk.cyan.bold(h)),
    style: { head: [], border: ['gray'] },
    colWidths: [20, 22, 22],
  })
  rows.forEach((r) => table.push(r))
  console.log(table.toString())
}
