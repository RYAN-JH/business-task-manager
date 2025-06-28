'use client'

import './globals.css'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="glass-background">
        <SessionProvider>
          <div className="min-h-screen relative">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}