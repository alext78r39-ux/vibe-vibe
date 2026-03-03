'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  GraduationCap, ChevronDown, Keyboard, Moon, Search, PartyPopper,
  FormInput, GripVertical, Layers, MessageSquare, Sparkles,
  Component, Loader, InboxIcon, Smartphone,
  Store, SlidersHorizontal, ListFilter, ShieldAlert, BarChart3, Type, GalleryHorizontalEnd, Gauge,
  CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: FormInput,
    name: '表单验证',
    lib: 'react-hook-form + zod',
    desc: '输入框自动校验，提交时检查规则，错误信息实时显示。前后端共用同一份验证规则。',
    tryIt: '不输入标题直接点「添加」，看看红色错误提示。',
    prompt: '帮我加一个表单，用 react-hook-form 和 zod 做验证，标题必填，最多 200 字。',
  },
  {
    icon: Moon,
    name: '暗色模式',
    lib: 'next-themes',
    desc: '一键切换亮色/暗色主题，自动跟随系统偏好。基于 CSS class 切换，无闪烁。',
    tryIt: '点击右上角的月亮/太阳图标切换主题。',
    prompt: '帮我加暗色模式，用 next-themes，支持跟随系统、手动切换。',
  },
  {
    icon: Search,
    name: '防抖搜索',
    lib: 'use-debounce',
    desc: '输入时延迟 300ms 才触发过滤，避免每按一个键都刷新列表，提升性能。',
    tryIt: '在搜索框快速输入文字，注意列表不会逐字刷新。',
    prompt: '加一个搜索框，用 use-debounce 做 300ms 防抖，按标题过滤列表。',
    verify: '打开 DevTools Network，快速输入 5 个字，确认只触发了 1 次过滤而非 5 次。',
  },
  {
    icon: PartyPopper,
    name: '庆祝动效',
    lib: 'canvas-confetti',
    desc: '当所有待办全部完成时，触发一次彩纸庆祝动画。只在进度从 0→100% 时触发。',
    tryIt: '添加几个待办，然后全部勾选完成。',
    prompt: '当所有待办完成时放一个 confetti 彩纸动画庆祝。',
  },
  {
    icon: GripVertical,
    name: '拖拽排序',
    lib: '@dnd-kit',
    desc: '长按拖动待办项可以调整顺序，松手后自动保存新顺序到数据库。',
    tryIt: '按住一个待办项上下拖动，松手后刷新页面看顺序是否保留。',
    prompt: '先帮我规划一下拖拽排序的方案（用 @dnd-kit），确认后再实现。拖完后新顺序要存到数据库。',
    verify: '拖动排序后刷新页面，顺序保留说明已存入数据库。',
  },
  {
    icon: Keyboard,
    name: '键盘快捷键',
    lib: 'react-hotkeys-hook',
    desc: '全局快捷键：Ctrl+N 聚焦输入框，Ctrl+/ 打开快捷键帮助。',
    tryIt: '按 Ctrl+N 聚焦输入框，按 Ctrl+/ 打开快捷键帮助。',
    prompt: '加几个快捷键，Ctrl+N 聚焦输入框，Ctrl+/ 显示帮助面板。',
  },
  {
    icon: Component,
    name: 'shadcn/ui 组件',
    lib: 'radix-ui + cva',
    desc: '基于 Radix UI 无头组件 + class-variance-authority 构建的可复用 UI 组件库。Button、Badge、Dialog、Tooltip 等组件开箱即用。',
    tryIt: '悬停待办项查看 Tooltip，点击删除按钮查看确认 Dialog。',
    prompt: '帮我引入 shadcn/ui 的 Button、Dialog、Tooltip 组件，替换原生按钮。',
  },
  {
    icon: Loader,
    name: '骨架屏加载',
    lib: 'Skeleton 组件',
    desc: '数据加载时显示与内容结构一致的灰色脉冲占位符，避免白屏闪烁，提升感知性能。',
    tryIt: '刷新页面观察列表加载时的骨架屏动画。',
    prompt: '加载数据时显示骨架屏，用 animate-pulse 做脉冲动画。',
    verify: 'DevTools → Network → Slow 3G，刷新页面确认骨架屏出现而非白屏。',
  },
  {
    icon: InboxIcon,
    name: '空状态设计',
    lib: 'EmptyState 组件',
    desc: '列表为空时显示引导性插画和操作按钮，而不是空白页面。帮助用户理解下一步操作。',
    tryIt: '删除所有待办，查看空状态页面和「添加第一个待办」按钮。',
    prompt: '列表为空时显示一个空状态组件，带插画和引导按钮。',
  },
  {
    icon: Smartphone,
    name: '响应式 + 无障碍',
    lib: 'Tailwind 断点 + ARIA',
    desc: '移动端侧边栏变为抽屉式弹出，表单按钮自适应。所有交互元素添加 aria-label，支持键盘 Tab 导航和 focus-visible 样式。',
    tryIt: '缩小浏览器窗口到手机宽度，点击「学习面板」按钮打开侧边栏。',
    prompt: '帮我做移动端适配，侧边栏改为抽屉，加 aria-label 和 focus-visible 样式。',
    verify: 'F12 切换到手机视图，确认侧边栏变抽屉。用 Tab 键导航确认焦点环可见。',
  },
  {
    icon: Store,
    name: '全局状态管理',
    lib: 'zustand',
    desc: '用 Zustand 管理侧边栏、快捷键面板、搜索等全局状态。比 Context 更简洁，无需 Provider 嵌套，支持选择器避免不必要的重渲染。',
    tryIt: '打开侧边栏、搜索、快捷键面板，注意它们的状态互不干扰。',
    prompt: '先帮我规划一下状态管理方案：把 sidebar、search、shortcuts 的状态用 zustand 提取到全局 store，我确认后再改代码。',
    verify: 'React DevTools 中观察：切换侧边栏时，TodoList 组件不会重渲染。',
  },
  {
    icon: SlidersHorizontal,
    name: 'Tabs 分类筛选',
    lib: '@radix-ui/react-tabs',
    desc: '用 Radix Tabs 替代手动 role="tablist"，自动获得键盘 ← → 导航和 ARIA 属性。',
    tryIt: '用键盘方向键在分类标签间切换。',
    prompt: '帮我用 Radix Tabs 组件重构分类筛选，支持键盘导航。',
  },
  {
    icon: ListFilter,
    name: 'Select 分类选择器',
    lib: '@radix-ui/react-select',
    desc: '表单中的分类下拉选择器，基于 Radix Select 构建。支持键盘操作、自动定位、无障碍。',
    tryIt: '添加待办时点击「分类」下拉框选择分类。',
    prompt: '帮我在表单里加一个 Radix Select 下拉框，选择待办分类。',
  },
  {
    icon: ShieldAlert,
    name: 'AlertDialog 删除确认',
    lib: '@radix-ui/react-alert-dialog',
    desc: '删除确认弹窗使用 AlertDialog 而非 Dialog。区别：AlertDialog 点击遮罩层不会关闭，防止误操作。',
    tryIt: '点击删除按钮，注意点击弹窗外部不会关闭确认框。',
    prompt: '帮我把删除确认改成 AlertDialog，防止用户误点遮罩关闭。',
  },
  {
    icon: BarChart3,
    name: '分类统计图表',
    lib: 'recharts',
    desc: '用 Recharts 饼图展示各分类的待办数量分布。可折叠设计，默认收起不占空间。',
    tryIt: '点击「查看统计」展开饼图，添加不同分类的待办观察变化。',
    prompt: '帮我加一个饼图，用 recharts 按分类统计待办数量。',
  },
  {
    icon: Type,
    name: 'Markdown 标题',
    lib: 'react-markdown + remark-gfm',
    desc: '待办标题支持 Markdown 行内语法：**加粗**、*斜体*、~~删除线~~、`代码`。',
    tryIt: '添加一个标题为 **重要** 的待办，看看加粗效果。',
    prompt: '帮我让待办标题支持 Markdown 渲染，用 react-markdown。',
  },
  {
    icon: GalleryHorizontalEnd,
    name: '技术栈轮播',
    lib: 'embla-carousel-react',
    desc: '底部水平轮播展示本页用到的技术栈卡片。支持触摸滑动、拖拽、圆点指示器。',
    tryIt: '在列表下方左右滑动技术栈卡片。',
    prompt: '帮我加一个轮播组件，用 embla-carousel 展示技术栈卡片。',
  },
]

const archLayers = [
  { name: 'UI 层', tech: 'React · Motion · Tailwind' },
  { name: '状态层', tech: 'TanStack Query · nuqs · Zustand' },
  { name: 'API 层', tech: 'Next.js Route Handlers · Zod' },
  { name: '数据层', tech: 'Drizzle ORM · Neon PostgreSQL' },
]

export function TeachingSidebar() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border-light px-4 py-3">
        <GraduationCap size={18} className="text-primary" />
        <span className="text-sm font-semibold text-text-heading">学习面板</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Architecture */}
        <div className="border-b border-border-light px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Layers size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-text-heading">技术架构</span>
          </div>
          <div className="space-y-1">
            {archLayers.map((l, i) => (
              <div key={l.name} className="flex items-center gap-2 text-[11px]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-text-muted">{l.name}</span>
                <span className="teaching-lib-tag rounded px-1 py-0.5 text-[9px] font-mono">{l.tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Workflow Tip */}
        <div className="border-b border-border-light px-4 py-2.5">
          <div className="teaching-workflow-tip rounded-lg px-2.5 py-2 text-[11px]">
            <div className="mb-1 font-medium text-text-heading">🔄 AI 工作流</div>
            <p className="text-text-muted">说需求 → AI 先出方案 → 你确认 → AI 实现 → 你验证</p>
          </div>
        </div>

        {/* Features */}
        <div className="px-2 py-2">
          <div className="mb-2 flex items-center gap-1.5 px-2">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-text-heading">本页功能</span>
            <span className="text-[10px] text-text-muted">（点击展开）</span>
          </div>
          <div className="space-y-1">
            {features.map((f, i) => {
              const isOpen = expandedIdx === i
              return (
                <div key={f.name} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedIdx(isOpen ? null : i)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                      isOpen ? 'bg-primary/5' : 'hover:bg-primary/5'
                    }`}
                  >
                    <f.icon size={13} className="shrink-0 text-primary" />
                    <span className="flex-1 text-[11px] font-medium text-text-heading">{f.name}</span>
                    <span className="text-[9px] font-mono text-text-muted">{f.lib}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
                      <ChevronDown size={12} className="text-text-muted" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 px-3 pb-3 pt-1">
                          <p className="text-[11px] leading-relaxed text-text-muted">{f.desc}</p>
                          <div className="teaching-try-tag rounded-lg px-2.5 py-1.5 text-[11px]">
                            <span className="font-medium text-primary">试一试：</span>{f.tryIt}
                          </div>
                          <div className="sidebar-prompt rounded-lg px-2.5 py-1.5">
                            <div className="mb-0.5 flex items-center gap-1">
                              <MessageSquare size={10} className="text-primary" />
                              <span className="text-[10px] font-medium text-primary">怎么跟 AI 说</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-text">&ldquo;{f.prompt}&rdquo;</p>
                          </div>
                          {f.verify && (
                            <div className="sidebar-verify rounded-lg px-2.5 py-1.5">
                              <div className="mb-0.5 flex items-center gap-1">
                                <CheckCircle size={10} className="text-green-600 dark:text-green-400" />
                                <span className="text-[10px] font-medium text-green-700 dark:text-green-400">验证</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-text-muted">{f.verify}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
