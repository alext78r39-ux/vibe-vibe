'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  GraduationCap, ChevronDown, List, Command, CalendarDays, Bell,
  Keyboard, Shield, Layers, MessageSquare, Sparkles,
  ArrowRightLeft, KeyRound, Accessibility, Smartphone,
  Link2, Zap, SlidersHorizontal, ToggleRight, Upload, BarChart3, Table2,
  CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    name: '用户认证',
    lib: 'better-auth',
    desc: '邮箱密码注册/登录，Session 自动管理，未登录自动跳转登录页。',
    tryIt: '点右上角登出，然后重新注册一个账号登录。',
    prompt: '先帮我规划认证方案（用 better-auth），包括注册、登录、Session 管理、未登录跳转，我确认后再实现。',
    verify: '登出后直接访问 /dashboard，确认被重定向到登录页。',
  },
  {
    icon: List,
    name: '虚拟列表',
    lib: '@tanstack/react-virtual',
    desc: '只渲染屏幕可见的 DOM 节点，即使上万条数据也不卡。滚动到底部自动加载下一页。',
    tryIt: '添加大量待办，快速滚动列表，打开 DevTools 观察 DOM 节点数量不变。',
    prompt: '列表数据量大，帮我用 @tanstack/react-virtual 做虚拟滚动，滚到底部自动加载。',
    verify: '添加 50+ 待办后打开 DevTools Elements，确认列表 DOM 节点数远少于数据量。',
  },
  {
    icon: Command,
    name: '命令面板',
    lib: 'cmdk',
    desc: '类似 VS Code 的 Ctrl+K 命令面板，模糊搜索、键盘导航、分组命令。',
    tryIt: '按 Ctrl+K (Mac: Cmd+K) 打开命令面板，输入关键词搜索。',
    prompt: '加一个 Cmd+K 命令面板，用 cmdk 库，支持搜索命令、筛选、导航。',
  },
  {
    icon: CalendarDays,
    name: '日期选择器',
    lib: 'react-day-picker',
    desc: '点击日历图标弹出日期选择，选择后自动关闭。支持点击外部和 Esc 关闭。',
    tryIt: '点击表单中的日历图标，选择一个日期，然后添加待办。',
    prompt: '加一个日期选择弹窗，用 react-day-picker，点击外部或按 Esc 关闭。',
  },
  {
    icon: Bell,
    name: '三态通知',
    lib: 'sonner · toast.promise',
    desc: '一个 toast 自动展示异步操作三个阶段：加载中 → 成功 → 失败。',
    tryIt: '添加或删除一个待办，观察底部通知从「加载中」变为「成功」。',
    prompt: '操作待办时用 sonner 的 toast.promise 显示加载中/成功/失败三个状态。',
  },
  {
    icon: Keyboard,
    name: '键盘快捷键',
    lib: 'react-hotkeys-hook',
    desc: 'mod+k 自动适配 Windows 的 Ctrl 和 Mac 的 Cmd。',
    tryIt: '按 Ctrl+K / Cmd+K 打开命令面板。',
    prompt: '加全局快捷键 Ctrl+K 打开命令面板，用 react-hotkeys-hook。',
  },
  {
    icon: ArrowRightLeft,
    name: '页面过渡动画',
    lib: 'Motion',
    desc: '页面切换时使用 spring 动画平滑过渡，表单验证失败时触发抖动动画反馈。',
    tryIt: '在登录页输入错误密码，观察表单抖动效果。',
    prompt: '登录失败时加一个表单抖动动画，用 motion 的 spring。',
  },
  {
    icon: KeyRound,
    name: '密码强度指示',
    lib: '自定义逻辑',
    desc: '注册时实时检测密码强度（长度、大小写、数字、特殊字符），用彩色进度条可视化展示。',
    tryIt: '在注册页输入密码，观察下方强度指示条从红到绿的变化。',
    prompt: '注册表单加密码强度检测，用进度条显示弱/中/强。',
  },
  {
    icon: Accessibility,
    name: '无障碍最佳实践',
    lib: 'ARIA + focus-visible',
    desc: '所有交互元素添加 aria-label，支持键盘 Tab 导航，focus-visible 高亮当前焦点，prefers-reduced-motion 关闭动画。',
    tryIt: '用 Tab 键在页面中导航，观察焦点环样式。',
    prompt: '帮我加无障碍支持，所有按钮加 aria-label，加 focus-visible 样式。',
  },
  {
    icon: Smartphone,
    name: '移动端适配',
    lib: 'Tailwind 响应式',
    desc: '移动端侧边栏变为滑出抽屉，表单按钮自适应宽度，触摸友好的按钮尺寸。',
    tryIt: '缩小浏览器窗口到手机宽度，点击学习面板图标打开侧边栏。',
    prompt: '帮我做移动端适配，侧边栏改为抽屉弹出，按钮加大触摸区域。',
  },
  {
    icon: Link2,
    name: 'URL 状态同步',
    lib: 'nuqs',
    desc: '优先级筛选状态同步到 URL 参数（?priority=high），刷新页面保留筛选，可分享链接。',
    tryIt: '选择「高优先」筛选，观察地址栏出现 ?priority=high，刷新页面筛选保留。',
    prompt: '帮我把筛选状态同步到 URL，用 nuqs，刷新页面保留筛选。',
    verify: '选择「高优先」后复制地址栏 URL，新标签页打开确认筛选状态一致。',
  },
  {
    icon: Zap,
    name: 'Server Action',
    lib: 'next-safe-action',
    desc: '类型安全的 Server Action，带 auth 中间件自动验证登录。点击闪电图标切换 API/Action 模式。',
    tryIt: '点击表单旁的闪电按钮切换到 Server Action 模式，添加待办后打开 Network 面板观察请求。',
    prompt: '先帮我规划一下 Server Action 方案：用 next-safe-action 创建类型安全的 action，带认证中间件，我看完方案再实现。',
    verify: '切换到 Action 模式添加待办，Network 面板确认请求是 POST 到当前页面而非 /api/todos。',
  },
  {
    icon: SlidersHorizontal,
    name: 'Tabs 标签页',
    lib: '@radix-ui/react-tabs',
    desc: '个人资料页使用 Tabs 组件分为「概览」和「设置」两个标签页，自动键盘导航。',
    tryIt: '进入个人资料页，用键盘方向键在「概览」和「设置」标签间切换。',
    prompt: '帮我用 Radix Tabs 把个人资料页分成概览和设置两个标签页。',
  },
  {
    icon: ToggleRight,
    name: 'Switch 开关',
    lib: '@radix-ui/react-switch',
    desc: '设置页的开关组件，状态存 localStorage。支持「紧凑模式」和「显示已完成」两个偏好。',
    tryIt: '进入个人资料 → 设置标签，切换「紧凑模式」开关。',
    prompt: '帮我加设置开关，用 Radix Switch，状态存 localStorage。',
  },
  {
    icon: Upload,
    name: '头像上传',
    lib: 'react-dropzone',
    desc: '拖拽或点击上传头像，支持预览、大小限制（2MB）、自动转 base64 存储。',
    tryIt: '在个人资料页，悬停头像出现上传图标，点击或拖拽图片上传。',
    prompt: '帮我加头像上传，用 react-dropzone，支持拖拽和预览。',
  },
  {
    icon: BarChart3,
    name: '优先级分布图',
    lib: 'recharts',
    desc: '用饼图展示待办的优先级分布（高/中/低），可折叠设计。',
    tryIt: '在 Dashboard 点击「优先级分布」展开饼图。',
    prompt: '帮我加一个饼图，用 recharts 按优先级统计待办数量。',
  },
  {
    icon: Table2,
    name: '表格视图',
    lib: '@tanstack/react-table',
    desc: '列表/表格双视图切换。表格支持点击列头排序，视图偏好存 localStorage。',
    tryIt: '点击筛选栏右侧的表格图标切换到表格视图，点击列头排序。',
    prompt: '帮我加表格视图，用 @tanstack/react-table，支持排序和视图切换。',
    verify: '切换到表格视图后刷新页面，确认视图偏好保留（localStorage）。点击列头确认排序生效。',
  },
]

const archLayers = [
  { name: 'UI 层', tech: 'React · Motion · Tailwind' },
  { name: '状态层', tech: 'TanStack Query · nuqs · TanStack Table · Virtual' },
  { name: '认证层', tech: 'Better Auth · Session' },
  { name: 'API 层', tech: 'Route Handlers · Server Actions · Zod' },
  { name: '数据层', tech: 'Drizzle ORM · Neon PostgreSQL' },
]

export function TeachingSidebar() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <GraduationCap size={18} className="text-primary" />
        <span className="text-sm font-semibold text-text-heading">学习面板</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Architecture */}
        <div className="border-b border-border px-4 py-3">
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
        <div className="border-b border-border px-4 py-2.5">
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
                                <CheckCircle size={10} className="text-green-400" />
                                <span className="text-[10px] font-medium text-green-400">验证</span>
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
