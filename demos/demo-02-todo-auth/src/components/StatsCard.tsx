'use client'

import { motion } from 'motion/react'
import { CheckCircle, ListTodo, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  total: number
  completed: number
  thisWeek: number
}

export function StatsCard({ total, completed, thisWeek }: StatsCardProps) {
  const stats = [
    { icon: ListTodo, label: '总待办', value: total, color: 'text-primary' },
    { icon: CheckCircle, label: '已完成', value: completed, color: 'text-check' },
    { icon: TrendingUp, label: '本周新增', value: thisWeek, color: 'text-purple-400' },
  ]

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card flex flex-col items-center gap-1.5 rounded-xl px-3 py-4"
        >
          <s.icon size={18} className={s.color} />
          <span className="text-xl font-semibold text-text-heading">{s.value}</span>
          <span className="text-[10px] text-text-muted">{s.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
