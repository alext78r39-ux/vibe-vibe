'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await authClient.signIn.email({ email, password })
    setSubmitting(false)
    if (error) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      toast.error(error.message ?? '登录失败')
      return
    }
    toast.success('登录成功')
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
          <Shield size={32} className="text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-text-heading">认证版 Todo</h2>
        <p className="mt-2 max-w-xs text-center text-sm text-text-muted">
          一个带完整用户认证的待办应用，展示登录、注册、会话管理的最佳实践
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Better Auth', 'Server Actions', 'Drizzle ORM'].map((tag) => (
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
              <LogIn size={22} className="text-primary" />
            </motion.div>
            <h1 className="text-2xl font-semibold text-text-heading">欢迎回来</h1>
            <p className="mt-1 text-sm text-text-muted">登录你的账号继续使用</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? '登录中...' : (
                <>登录 <ArrowRight size={14} /></>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            没有账号？
            <Link href="/register" className="ml-1 text-primary hover:underline">去注册</Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
