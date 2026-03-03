import { Skeleton } from '@/components/ui/skeleton'

export function TodoSkeleton() {
  return (
    <div className="space-y-2.5" role="status" aria-label="加载中">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="todo-card flex items-center gap-3 rounded-xl px-4 py-3.5"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
        </div>
      ))}
      <span className="sr-only">正在加载待办列表...</span>
    </div>
  )
}
