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
    // Check authentication using sessionStorage (automatically clears when tab closes)
    const isAuthenticated = sessionStorage.getItem('isAuthenticated')
    if (isAuthenticated !== 'true' && pathname !== '/') {
      router.push('/')
    }
    
    // Read adminUser from sessionStorage only on client side
    const user = sessionStorage.getItem('adminUser') || 'Admin User'
    setAdminUser(user)

    // Auto-logout when tab is closed (extra safety measure)
    // Note: sessionStorage automatically clears when tab closes, but we add this for explicit cleanup
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('adminUser')
    }

    // Listen for tab close
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [router, pathname])

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/destinations': 'Destinations',
    '/analytics': 'Analytics',
    '/categories': 'Categories',
  }

  const pageTitle = pageTitles[pathname] || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F0F9FF] via-white to-[#ECFDF5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="bg-white/90 backdrop-blur-xl border-b-2 border-[#2EC4B6]/20 px-6 lg:px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A] truncate tracking-tight font-poppins bg-gradient-to-r from-[#0F172A] via-[#0F4C5C] to-[#2EC4B6] bg-clip-text text-transparent">{pageTitle}</h1>
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            <button className="relative p-2.5 text-[#64748B] hover:text-[#0F4C5C] transition-colors rounded-lg hover:bg-[#0F4C5C]/10">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#0F4C5C] to-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-[#0F172A] truncate max-w-[120px]">{adminUser}</p>
                <p className="text-sm text-[#64748B] font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
