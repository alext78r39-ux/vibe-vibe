import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users, posts, comments, likes, followers, tags, postTags } from './db/schema.js'

// ── Insert schemas（用于验证写入数据）──
export const insertUserSchema = createInsertSchema(users, {
  nickname: (schema) => schema.min(1, '昵称不能为空').max(50, '昵称最多 50 字'),
})

export const insertPostSchema = createInsertSchema(posts, {
  content: (schema) => schema.min(1, '内容不能为空').max(2000, '内容最多 2000 字'),
})

export const insertCommentSchema = createInsertSchema(comments, {
  content: (schema) => schema.min(1, '评论不能为空').max(500, '评论最多 500 字'),
})

export const insertLikeSchema = createInsertSchema(likes)
export const insertFollowerSchema = createInsertSchema(followers)
export const insertTagSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(1, '标签名不能为空').max(30, '标签名最多 30 字'),
})
export const insertPostTagSchema = createInsertSchema(postTags)

// ── Select schemas（用于验证读取数据）──
export const selectUserSchema = createSelectSchema(users)
export const selectPostSchema = createSelectSchema(posts)
export const selectCommentSchema = createSelectSchema(comments)
