'use client'

import { useQueryState } from 'nuqs'
import { motion } from 'motion/react'
import { Inbox, Briefcase, User, LayoutGrid } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const categories = [
  { value: 'all', label: '全部', icon: LayoutGrid },
  { value: 'inbox', label: '收件箱', icon: Inbox },
  { value: 'work', label: '工作', icon: Briefcase },
  { value: 'personal', label: '个人', icon: User },
] as const

export function CategoryFilter() {
  const [category, setCategory] = useQueryState('category', { defaultValue: 'all' })

  return (
    <Tabs value={category} onValueChange={setCategory} className="mb-6">
      <TabsList aria-label="分类筛选">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = category === cat.value
          return (
            <TabsTrigger key={cat.value} value={cat.value} className="relative">
              {isActive && (
                <motion.div
                  layoutId="category-bg"
                  className="absolute inset-0 rounded-lg bg-primary-light"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className="relative z-10 cursor-pointer gap-1.5 bg-transparent"
              >
                <Icon size={12} />
                {cat.label}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
