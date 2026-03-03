'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { CalendarDays } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerPopoverProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
}

export function DatePickerPopover({ selected, onSelect }: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
        aria-label="选择日期"
      >
        <CalendarDays size={14} />
        {selected ? selected.toLocaleDateString('zh-CN') : '截止日期'}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-border bg-surface p-2 shadow-xl rdp-dark">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(day) => {
              onSelect(day ?? undefined)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
