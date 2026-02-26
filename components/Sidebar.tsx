'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, MapPin, BarChart3, Folder, LogOut } from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Destinations', icon: MapPin, path: '/destinations' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Categories', icon: Folder, path: '/categories' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('adminUser')
      router.push('/')
    }
  }

  return (
    <div className="w-64 bg-primary-800 min-h-screen p-6 flex flex-col shadow-lg border-r border-primary-700">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lakbay CamSur</h1>
        </div>
        <p className="text-primary-100 text-sm ml-[52px] font-medium opacity-90">Admin Dashboard</p>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-secondary-400 text-white shadow-md'
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold text-base">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary-100 hover:bg-red-600/15 hover:text-white transition-colors border border-transparent hover:border-red-500/30 mt-auto text-sm"
      >
        <LogOut size={20} />
        <span className="font-semibold text-base">Logout</span>
      </button>
    </div>
  )
}
