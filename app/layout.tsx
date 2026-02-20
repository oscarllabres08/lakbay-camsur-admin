import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lakbay CamSur - Admin Dashboard',
  description: 'Admin dashboard for managing Lakbay CamSur destinations',
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
