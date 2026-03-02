'use client'

import { useState } from 'react'
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const requestLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('adminUser')
    setShowLogoutModal(false)
    router.push('/')
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
    <div className="hidden lg:flex w-64 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#334155] h-screen p-6 flex-col shadow-2xl border-r border-[#2EC4B6]/20 fixed left-0 top-0 overflow-hidden z-50">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
      
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-xl font-poppins">LC</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white tracking-tight font-poppins truncate">Lakbay CamSur</h1>
            <p className="text-[#CBD5E1] text-xs font-medium">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 min-h-0">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0F4C5C] to-[#2EC4B6] text-white shadow-lg shadow-[#2EC4B6]/30'
                  : 'text-[#CBD5E1] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="font-semibold text-base truncate">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={requestLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#CBD5E1] hover:bg-red-600/20 hover:text-white transition-all duration-200 border border-transparent hover:border-red-500/30 flex-shrink-0 text-sm mt-auto"
      >
        <LogOut size={20} className="flex-shrink-0" />
        <span className="font-semibold text-base">Logout</span>
      </button>
    </div>

    {showLogoutModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Log out</h2>
          <p className="text-sm text-gray-600 mb-5">
            Are you sure you want to log out of the Lakbay CamSur admin dashboard?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
