'use client'

import Layout from '@/components/Layout'
import { Plus, Folder } from 'lucide-react'

const categories = [
  {
    name: 'Nature & Adventure',
    destinations: 2,
    totalViews: 2232,
    totalVisits: 1544,
    color: 'bg-blue-500',
  },
  {
    name: 'Food & Dining',
    destinations: 1,
    totalViews: 1678,
    totalVisits: 1234,
    color: 'bg-pink-500',
  },
  {
    name: 'Heritage & Culture',
    destinations: 1,
    totalViews: 1456,
    totalVisits: 1123,
    color: 'bg-orange-500',
  },
  {
    name: 'Resort & Recreation',
    destinations: 1,
    totalViews: 2134,
    totalVisits: 1567,
    color: 'bg-teal-500',
  },
]

export default function CategoriesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-500 mt-1">Manage destination categories for Lakbay CamSur</p>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg hover:shadow-xl">
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className={`${category.color} p-6 flex items-center justify-center`}>
                <Folder className="text-white" size={48} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Destinations</p>
                    <p className="text-2xl font-bold text-gray-800">{category.destinations}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Views</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {category.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Visits</p>
                    <p className="text-lg font-semibold text-teal-600">
                      {category.totalVisits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
