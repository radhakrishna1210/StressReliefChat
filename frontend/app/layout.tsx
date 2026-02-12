import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'StressReliefChat - Instant Stress Conversation Platform',
  description: 'A calming, no-signup website for stressed users to instantly connect via AI triage to P2P empathetic listeners, AI voice companions, or licensed teletherapy.',
  keywords: 'stress relief chat, instant therapy India, P2P support Pune',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}

