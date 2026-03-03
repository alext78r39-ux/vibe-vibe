'use client'

import { motion } from 'motion/react'
import { Code2 } from 'lucide-react'

interface TeachingLabelProps {
  lib: string
  pattern?: string
}

export function TeachingLabel({ lib, pattern }: TeachingLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="teaching-label mb-2 flex items-center gap-1.5"
    >
      <Code2 size={10} className="text-primary" />
      <span className="text-[10px] font-mono text-primary">{lib}</span>
      {pattern && (
        <span className="text-[10px] text-text-muted">· {pattern}</span>
      )}
    </motion.div>
  )
}
