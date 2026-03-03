'use client'

import { Command } from 'cmdk'
import { Plus, Filter, User, LogOut } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTodo?: () => void
  onFilterPriority?: (p: string) => void
  onProfile?: () => void
  onLogout?: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onAddTodo,
  onFilterPriority,
  onProfile,
  onLogout,
}: CommandPaletteProps) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="命令面板"
      className="cmd-dialog"
    >
      <Command.Input placeholder="输入命令..." className="cmd-input" aria-label="搜索命令" />
      <Command.List className="cmd-list">
        <Command.Empty className="cmd-empty">没有找到命令</Command.Empty>
        <Command.Group heading="操作" className="cmd-group">
          <Command.Item className="cmd-item" onSelect={() => { onAddTodo?.(); onOpenChange(false) }}>
            <Plus size={14} /> 添加待办
          </Command.Item>
        </Command.Group>
        <Command.Group heading="筛选" className="cmd-group">
          {['high', 'medium', 'low'].map((p) => (
            <Command.Item key={p} className="cmd-item" onSelect={() => { onFilterPriority?.(p); onOpenChange(false) }}>
              <Filter size={14} /> 筛选：{p === 'high' ? '高优先级' : p === 'medium' ? '中优先级' : '低优先级'}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="导航" className="cmd-group">
          <Command.Item className="cmd-item" onSelect={() => { onProfile?.(); onOpenChange(false) }}>
            <User size={14} /> 个人资料
          </Command.Item>
          <Command.Item className="cmd-item" onSelect={() => { onLogout?.(); onOpenChange(false) }}>
            <LogOut size={14} /> 登出
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
