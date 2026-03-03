'use client'

import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { motion, AnimatePresence } from 'motion/react'
import { BarChart3, ChevronDown } from 'lucide-react'

const COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

const LABELS: Record<string, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
}

interface DashboardChartProps {
  pages: Array<{ items: Array<{ priority: string }> }>
}

export function DashboardChart({ pages }: DashboardChartProps) {
  const [open, setOpen] = useState(false)

  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const page of pages) {
      for (const item of page.items) {
        const p = item.priority || 'medium'
        counts[p] = (counts[p] || 0) + 1
      }
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: LABELS[name] || name,
      value,
      color: COLORS[name] || '#94a3b8',
    }))
  }, [pages])

  if (data.length === 0) return null

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface-elevated p-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-xs font-medium text-text-muted hover:text-text"
      >
        <BarChart3 size={14} className="text-primary" />
        <span>优先级分布</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={12} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '0.7rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
