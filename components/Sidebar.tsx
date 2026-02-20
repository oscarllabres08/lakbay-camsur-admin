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
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('adminUser')
    router.push('/')
  }

  return (
    <div className="w-64 bg-primary-800 min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Lakbay CamSur</h1>
        <p className="text-primary-200 text-sm">Admin Dashboard</p>
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
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-primary-700 hover:text-white transition-colors"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}
