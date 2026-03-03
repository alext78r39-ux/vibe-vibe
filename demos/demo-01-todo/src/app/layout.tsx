import type { Metadata } from 'next'
import { Caveat, DM_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import { ThemeToggle } from '@/components/ThemeToggle'
import './globals.css'

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Todo App',
  description: '第七章 CRUD 示例',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${caveat.variable} ${dmSans.variable}`}>
      <body className="min-h-screen font-sans text-text antialiased">
        <Providers>
          <ThemeToggle />
          {children}
          <Toaster position="bottom-right" richColors />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
