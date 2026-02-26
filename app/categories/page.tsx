'use client'

import { useEffect, useState } from 'react'
import { Folder, Loader2 } from 'lucide-react'
import { getCategoryStatistics } from '@/lib/analytics'

// Category color mapping
const categoryColorMap: Record<string, string> = {
  'nature': 'bg-blue-500',
  'Nature & Adventure': 'bg-blue-500',
  'food': 'bg-pink-500',
  'Food & Dining': 'bg-pink-500',
  'heritage': 'bg-orange-500',
  'Heritage & Culture': 'bg-orange-500',
  'resorts': 'bg-teal-500',
  'Resort & Recreation': 'bg-teal-500',
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Array<{
    name: string;
    destinations: number;
    totalViews: number;
    totalVisits: number;
    color: string;
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getCategoryStatistics()
        const formattedCategories = stats.map(cat => ({
          name: cat.name,
          destinations: cat.destinations,
          totalViews: cat.totalViews,
          totalVisits: cat.totalVisits,
          color: categoryColorMap[cat.name] || 'bg-gray-500',
        }))
        setCategories(formattedCategories)
      } catch (error) {
        console.error('Error fetching category statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-500 mt-1">View how each category is performing.</p>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-primary-600 animate-spin" size={32} />
              <p className="text-gray-500">Loading category data...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
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
        )}
      </div>
  )
}
