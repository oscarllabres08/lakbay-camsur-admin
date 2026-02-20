'use client'

import Layout from '@/components/Layout'
import { MapPin, Eye, Users, Folder } from 'lucide-react'

// Mock data - will be replaced with actual data later
const mockDestinations = [
  { name: 'CWC Watersports Complex', category: 'Resort & Recreation', views: 2134, image: '/api/placeholder/300/200' },
  { name: 'Bicolano Delicacies Tour', category: 'Food & Dining', views: 1678, image: '/api/placeholder/300/200' },
  { name: 'Naga Metropolitan Cathedral', category: 'Heritage & Culture', views: 1456, image: '/api/placeholder/300/200' },
  { name: 'Caramoan Islands', category: 'Nature & Adventure', views: 1245, image: '/api/placeholder/300/200' },
  { name: 'Mt. Isarog National Park', category: 'Nature & Adventure', views: 987, image: '/api/placeholder/300/200' },
]

const categories = [
  { name: 'Nature & Adventure', count: 2, views: 2232, color: 'bg-blue-500' },
  { name: 'Food & Dining', count: 1, views: 1678, color: 'bg-pink-500' },
  { name: 'Heritage & Culture', count: 1, views: 1456, color: 'bg-orange-500' },
  { name: 'Resort & Recreation', count: 1, views: 2134, color: 'bg-teal-500' },
]

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-primary-600" size={24} />
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">5</p>
            <p className="text-sm text-gray-500">Total Destinations</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="text-blue-600" size={24} />
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+23%</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">7,500</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={24} />
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+18%</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">5,468</p>
            <p className="text-sm text-gray-500">Total Visits</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Folder className="text-orange-600" size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded">0%</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">4</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Destinations</h2>
            <div className="space-y-4">
              {mockDestinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <MapPin className="text-gray-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{dest.name}</p>
                    <p className="text-sm text-gray-500">{dest.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{dest.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Categories Overview</h2>
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Folder className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-sm text-gray-500">{cat.count} destinations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{cat.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
