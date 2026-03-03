'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, Settings, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useProfile, useUpdateProfile } from '@/lib/queries'
import { AvatarUpload } from '@/components/AvatarUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'

export default function ProfilePage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const router = useRouter()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState('')
  const [compact, setCompact] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)

  useEffect(() => {
    if (!sessionPending && !session) router.push('/login')
  }, [session, sessionPending, router])

  useEffect(() => {
    if (profile) setName(profile.user.name)
  }, [profile])

  useEffect(() => {
    setCompact(localStorage.getItem('pref-compact') === 'true')
    setShowCompleted(localStorage.getItem('pref-show-completed') !== 'false')
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateProfile.mutate(name.trim(), {
      onSuccess: () => toast.success('用户名已更新'),
    })
  }

  const handleLogout = async () => {
    await authClient.signOut()
    toast.success('已登出')
    router.push('/login')
  }

  if (sessionPending || isLoading) return <DashboardSkeleton />
  if (!session || !profile) return null

  const initials = profile.user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={16} />
            返回待办
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="更多操作">
                <Settings size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                返回待办
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-danger">
                <LogOut size={14} />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:sticky lg:top-8 lg:w-64 lg:shrink-0 lg:self-start">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="mx-auto mb-3 w-fit">
              <AvatarUpload
                initials={initials}
                currentImage={profile.user.image}
                onUploaded={() => {}}
              />
            </div>
            <h1 className="text-xl font-semibold text-text-heading">{profile.user.name}</h1>
            <p className="mt-1 text-sm text-text-muted">{profile.user.email}</p>
            <div className="my-4 border-t border-border" />
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-lg font-semibold text-text-heading">{profile.stats.total}</p>
                <p className="text-[10px] text-text-muted">总待办</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-check">{profile.stats.completed}</p>
                <p className="text-[10px] text-text-muted">已完成</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">{profile.stats.thisWeek}</p>
                <p className="text-[10px] text-text-muted">本周新增</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSave}
                className="glass-card rounded-xl p-6"
              >
                <h2 className="mb-4 text-sm font-medium text-text-heading">修改用户名</h2>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded-lg"
                    aria-label="用户名"
                  />
                  <Button type="submit" disabled={updateProfile.isPending} size="sm">
                    <Save size={14} />
                    保存
                  </Button>
                </div>
              </motion.form>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card space-y-5 rounded-xl p-6"
              >
                <h2 className="text-sm font-medium text-text-heading">偏好设置</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text">紧凑模式</p>
                    <p className="text-[11px] text-text-muted">减小列表项间距</p>
                  </div>
                  <Switch
                    checked={compact}
                    onCheckedChange={(v) => {
                      setCompact(v)
                      localStorage.setItem('pref-compact', String(v))
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text">显示已完成</p>
                    <p className="text-[11px] text-text-muted">在列表中显示已完成的待办</p>
                  </div>
                  <Switch
                    checked={showCompleted}
                    onCheckedChange={(v) => {
                      setShowCompleted(v)
                      localStorage.setItem('pref-show-completed', String(v))
                    }}
                  />
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
