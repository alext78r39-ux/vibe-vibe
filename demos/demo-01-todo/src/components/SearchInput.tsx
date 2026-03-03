'use client'

import { useDebouncedCallback } from 'use-debounce'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/app-store'

export function SearchInput() {
  const query = useAppStore((s) => s.search.query)
  const setSearch = useAppStore((s) => s.setSearch)
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearch(term)
  }, 300)

  return (
    <div className="relative mb-4">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <Input
        type="text"
        defaultValue={query}
        onChange={(e) => {
          debouncedSearch(e.target.value)
        }}
        placeholder="搜索待办..."
        className="rounded-lg py-2 pl-8 pr-3 text-xs"
        aria-label="搜索待办"
      />
    </div>
  )
}
