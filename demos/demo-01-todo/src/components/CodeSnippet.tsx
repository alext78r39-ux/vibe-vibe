'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Code2, ChevronDown, Copy, Check } from 'lucide-react'

interface CodeSnippetProps {
  title: string
  code: string
  language?: string
}

export function CodeSnippet({ title, code, language = 'tsx' }: CodeSnippetProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="teaching-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2"
      >
        <Code2 size={12} className="text-primary" />
        <span className="flex-1 text-left text-[11px] font-medium text-text-heading">{title}</span>
        <span className="text-[9px] font-mono text-text-muted">{language}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} className="text-text-muted" />
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
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md p-1 text-text-muted transition-colors hover:text-text"
                aria-label="复制代码"
              >
                {copied ? <Check size={12} className="text-check" /> : <Copy size={12} />}
              </button>
              <pre className="code-block overflow-x-auto px-3 py-2.5 text-[11px] leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
