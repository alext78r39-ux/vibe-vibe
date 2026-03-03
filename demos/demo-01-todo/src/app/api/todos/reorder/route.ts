import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, sql, inArray } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(),
    order: z.number().int().min(0),
  })).min(1).max(500),
})

// 批量更新排序 — 使用单条 SQL 的 CASE 表达式保证原子性
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: '无效的排序数据' }, { status: 400 })
    }

    const { items } = parsed.data
    const ids = items.map((i) => i.id)

    // 构建 CASE WHEN id=1 THEN 0 WHEN id=2 THEN 1 ... END
    const sqlChunks = [sql`(case`]
    for (const item of items) {
      sqlChunks.push(sql` when ${todos.id} = ${item.id} then ${item.order}`)
    }
    sqlChunks.push(sql` end)`)

    const caseExpression = sql.join(sqlChunks, sql.raw(''))

    await db
      .update(todos)
      .set({ order: caseExpression })
      .where(inArray(todos.id, ids))

    return Response.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/todos/reorder failed:', error)
    return Response.json({ error: '排序更新失败' }, { status: 500 })
  }
}
