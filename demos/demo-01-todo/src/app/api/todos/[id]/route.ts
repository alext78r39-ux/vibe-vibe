import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  completed: z.boolean(),
})

// U - Update（改）：切换完成状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = Number(id)
    if (!Number.isFinite(numId) || numId <= 0) {
      return Response.json({ error: '无效的 ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await db
      .update(todos)
      .set({ completed: parsed.data.completed })
      .where(eq(todos.id, numId))
      .returning()

    if (!updated.length) {
      return Response.json({ error: '未找到' }, { status: 404 })
    }
    return Response.json(updated[0])
  } catch (error) {
    console.error('PATCH /api/todos/[id] failed:', error)
    return Response.json({ error: '更新失败' }, { status: 500 })
  }
}

// D - Delete（删）：删除一条待办
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = Number(id)
    if (!Number.isFinite(numId) || numId <= 0) {
      return Response.json({ error: '无效的 ID' }, { status: 400 })
    }

    await db.delete(todos).where(eq(todos.id, numId))
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/todos/[id] failed:', error)
    return Response.json({ error: '删除失败' }, { status: 500 })
  }
}
