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

  const handleLogout = () => {
    // Clear simple local auth flags used by the demo admin panel
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('adminUser')
    router.push('/')
  }

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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 truncate tracking-tight">{pageTitle}</h1>
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-gray-800 truncate max-w-[120px]">{adminUser}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm border border-primary-700/80"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
