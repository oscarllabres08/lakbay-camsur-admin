'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { Bell, User } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState('Admin User')

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (isAuthenticated !== 'true' && pathname !== '/') {
      router.push('/')
    }
    
    // Read adminUser from localStorage only on client side
    const user = localStorage.getItem('adminUser') || 'Admin User'
    setAdminUser(user)
  }, [router, pathname])

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/destinations': 'Destinations',
    '/analytics': 'Analytics',
    '/categories': 'Categories',
  }

  const pageTitle = pageTitles[pathname] || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{adminUser}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
