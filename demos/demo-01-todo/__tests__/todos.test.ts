import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// 模拟数据库模块
vi.mock('../src/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, title: '测试', completed: false }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}))

vi.mock('../src/db/schema', () => ({
  todos: {
    id: 'id', title: 'title', completed: 'completed',
    category: 'category', order: 'order', createdAt: 'created_at',
  },
}))

// 导入路由处理函数
import { GET, POST } from '../src/app/api/todos/route'

describe('Todo API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/todos', () => {
    it('应该返回 200 和 todo 列表', async () => {
      const request = new NextRequest('http://localhost/api/todos')
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('支持按分类过滤', async () => {
      const request = new NextRequest('http://localhost/api/todos?category=work')
      const response = await GET(request)
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/todos', () => {
    it('应该创建新 todo 并返回 201', async () => {
      const request = new Request('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '学习数据库' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('title')
    })

    it('标题为空时应该返回 400', async () => {
      const request = new Request('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('缺少标题字段时应该返回 400', async () => {
      const request = new Request('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
