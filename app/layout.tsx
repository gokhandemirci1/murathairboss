import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Murat Hair Boss - Premium Barber Services',
  description: 'Book your appointment with Murat Hair Boss for premium barber services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
