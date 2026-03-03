'use client'

import { motion } from 'motion/react'

const priorities = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高优先', color: 'text-red-400' },
  { value: 'medium', label: '中优先', color: 'text-yellow-400' },
  { value: 'low', label: '低优先', color: 'text-green-400' },
] as const

interface PriorityFilterProps {
  value: string
  onChange: (v: string) => void
}

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <div className="mb-4 flex gap-2">
      {priorities.map((p) => {
        const isActive = value === p.value
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isActive ? 'text-text-heading' : 'text-text-muted hover:text-text'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="priority-bg"
                className="absolute inset-0 rounded-lg bg-surface-elevated"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}
