'use client'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Database, Layers, Zap, Palette, Shield, Keyboard, GripVertical,
  BarChart3, Type, SlidersHorizontal, Store, Gauge,
} from 'lucide-react'

const cards = [
  { icon: Layers, name: 'React 19', desc: '最新 React，支持 Server Components' },
  { icon: Zap, name: 'Next.js 16', desc: '全栈框架，API Routes + SSR' },
  { icon: Palette, name: 'Tailwind CSS', desc: '原子化 CSS，快速构建 UI' },
  { icon: Database, name: 'Drizzle ORM', desc: '类型安全的数据库操作' },
  { icon: Shield, name: 'Zod', desc: '运行时类型验证' },
  { icon: GripVertical, name: '@dnd-kit', desc: '拖拽排序' },
  { icon: Keyboard, name: 'react-hotkeys', desc: '键盘快捷键' },
  { icon: Store, name: 'Zustand', desc: '轻量全局状态管理' },
  { icon: SlidersHorizontal, name: 'Radix UI', desc: '无头 UI 组件（Tabs/Select/AlertDialog）' },
  { icon: BarChart3, name: 'Recharts', desc: '声明式图表库' },
  { icon: Type, name: 'react-markdown', desc: 'Markdown 渲染' },
  { icon: Gauge, name: 'Vercel Analytics', desc: '性能监控与分析' },
]

export function FeatureCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  return (
    <div className="mb-6 mt-2">
      <p className="mb-2 text-[11px] font-medium text-text-muted">本页技术栈</p>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <div
                key={c.name}
                className="flex min-w-[140px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border-light bg-surface-card px-4 py-3 text-center"
              >
                <Icon size={20} className="text-primary" />
                <span className="text-xs font-medium text-text-heading">{c.name}</span>
                <span className="text-[10px] leading-tight text-text-muted">{c.desc}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === selectedIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border'
            }`}
            aria-label={`滑动到第 ${i + 1} 页`}
          />
        ))}
      </div>
    </div>
  )
}
