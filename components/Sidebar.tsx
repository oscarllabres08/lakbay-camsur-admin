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
    <div className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 min-h-screen p-6 flex flex-col shadow-xl border-r border-primary-700">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Lakbay CamSur</h1>
        </div>
        <p className="text-primary-200 text-base ml-[52px] font-medium">Admin Dashboard</p>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white'
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
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-red-600/20 hover:text-white transition-colors border border-transparent hover:border-red-500/30 mt-auto"
      >
        <LogOut size={20} />
        <span className="font-semibold text-base">Logout</span>
      </button>
    </div>
  )
}
