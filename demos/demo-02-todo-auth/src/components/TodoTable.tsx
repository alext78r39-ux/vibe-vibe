'use client'

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TodoRow {
  id: number
  title: string
  completed: boolean
  priority: string
  dueDate: string | null
}

interface TodoTableProps {
  items: TodoRow[]
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

const columnHelper = createColumnHelper<TodoRow>()

const priorityColors: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
}

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export function TodoTable({ items, onToggle, onDelete }: TodoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('completed', {
        header: '✓',
        size: 40,
        cell: (info) => (
          <input
            type="checkbox"
            checked={info.getValue()}
            onChange={() => onToggle(info.row.original.id, !info.getValue())}
            className="h-4 w-4 cursor-pointer accent-primary"
            aria-label="完成状态"
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: '标题',
        cell: (info) => (
          <span className={info.row.original.completed ? 'text-text-muted line-through' : 'text-text'}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('priority', {
        header: '优先级',
        size: 80,
        cell: (info) => (
          <Badge variant={priorityColors[info.getValue()] as 'default' | 'destructive' | 'secondary'}>
            {priorityLabels[info.getValue()] || info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('dueDate', {
        header: '截止日期',
        size: 100,
        cell: (info) => {
          const v = info.getValue()
          if (!v) return <span className="text-text-muted">-</span>
          return <span className="text-xs">{format(new Date(v), 'M月d日', { locale: zhCN })}</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        cell: (info) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-text-muted hover:text-danger"
            onClick={() => onDelete(info.row.original.id)}
            aria-label="删除"
          >
            <Trash2 size={14} />
          </Button>
        ),
      }),
    ],
    [onToggle, onDelete]
  )

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border bg-surface-elevated">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left font-medium text-text-muted"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : (
                    <button
                      className="flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown size={10} />}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50 transition-colors hover:bg-surface-elevated/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
