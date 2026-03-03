import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Todo App (认证版)',
  description: '第八章 Better Auth 示例',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={spaceGrotesk.variable}>
      <body className="min-h-screen font-sans text-text antialiased">
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
