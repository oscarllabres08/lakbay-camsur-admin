import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lakbay CamSur - Admin Dashboard',
  description: 'Admin dashboard for managing Lakbay CamSur destinations',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Lakbay CamSur - Admin Dashboard',
    description: 'Secure admin panel for managing Lakbay CamSur destinations and analytics.',
    type: 'website',
    images: ['/favicon.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lakbay CamSur - Admin Dashboard',
    description: 'Secure admin panel for managing Lakbay CamSur destinations and analytics.',
    images: ['/favicon.svg'],
  },
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
