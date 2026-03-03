'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { UserPlus, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: '弱', color: 'bg-red-500' }
  if (score <= 3) return { score, label: '中', color: 'bg-yellow-500' }
  return { score, label: '强', color: 'bg-green-500' }
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const router = useRouter()

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await authClient.signUp.email({ name, email, password })
    setSubmitting(false)
    if (error) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      toast.error(error.message ?? '注册失败')
      return
    }
    toast.success('注册成功')
    router.push('/dashboard')
  }

  return (
    <main className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="hidden bg-gradient-to-br from-primary/5 via-transparent to-primary/10 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-dim">
          <UserPlus size={32} className="text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-text-heading">加入我们</h2>
        <p className="mt-2 max-w-xs text-center text-sm text-text-muted">
          创建账号即可体验完整的待办管理功能，数据安全存储在云端
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['密码加密', '会话管理', '头像上传'].map((tag) => (
            <span key={tag} className="glass-card rounded-lg px-3 py-1.5 text-xs text-text-muted">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shakeError ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={shakeError
          ? { x: { duration: 0.4 } }
          : { type: 'spring', stiffness: 260, damping: 24 }
        }
        className="glass-card w-full max-w-sm rounded-2xl p-6 sm:p-8"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dim"
          >
            <UserPlus size={22} className="text-primary" />
          </motion.div>
          <h1 className="text-2xl font-semibold text-text-heading">创建账号</h1>
          <p className="mt-1 text-sm text-text-muted">注册一个新账号开始使用</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10"
              aria-label="昵称"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
              aria-label="邮箱"
            />
          </div>
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10"
                aria-label="密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < strength.score ? strength.color : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-text-muted">
                  密码强度：<span className={strength.score <= 1 ? 'text-red-400' : strength.score <= 3 ? 'text-yellow-400' : 'text-green-400'}>{strength.label}</span>
                </p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? '注册中...' : (
              <>注册 <ArrowRight size={14} /></>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          已有账号？
          <Link href="/login" className="ml-1 text-primary hover:underline">去登录</Link>
        </p>
      </motion.div>
      </div>
    </main>
  )
}
