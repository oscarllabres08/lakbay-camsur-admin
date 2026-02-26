'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { MapPin, Eye, Users, Folder } from 'lucide-react'
import {
  getTotalDestinations,
  getTotalViews,
  getTotalVisits,
  getConfirmedVisits,
  getVisitIntents,
  getCategoryCount,
  getMostViewedDestinations,
  getMostConfirmedVisits,
  getViewsByCategory,
} from '@/lib/analytics'

export default function DashboardPage() {
  const [totalDestinations, setTotalDestinations] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalVisits, setTotalVisits] = useState(0)
  const [confirmedVisits, setConfirmedVisits] = useState(0)
  const [visitIntents, setVisitIntents] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [topDestinations, setTopDestinations] = useState<Array<{ name: string; category: string; municipality: string; views: number }>>([])
  const [topConfirmedVisits, setTopConfirmedVisits] = useState<Array<{ name: string; category: string; municipality: string; visits: number }>>([])
  const [categories, setCategories] = useState<Array<{ name: string; views: number; count: number; color: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destinations, views, visits, confirmed, intents, categories, topDests, topConfirmed, categoryViews] = await Promise.all([
          getTotalDestinations(),
          getTotalViews(),
          getTotalVisits(),
          getConfirmedVisits(),
          getVisitIntents(),
          getCategoryCount(),
          getMostViewedDestinations(5),
          getMostConfirmedVisits(5),
          getViewsByCategory(),
        ])

        setTotalDestinations(destinations)
        setTotalViews(views)
        setTotalVisits(visits)
        setConfirmedVisits(confirmed)
        setVisitIntents(intents)
        setCategoryCount(categories)
        setTopDestinations(topDests)
        setTopConfirmedVisits(topConfirmed)

        // Map category views to display format
        const categoryColors: Record<string, string> = {
          'Nature & Adventure': 'bg-blue-500',
          'Food & Dining': 'bg-pink-500',
          'Heritage & Culture': 'bg-orange-500',
          'Resort & Recreation': 'bg-teal-500',
          'resorts': 'bg-teal-500',
          'nature': 'bg-blue-500',
          'food': 'bg-pink-500',
          'heritage': 'bg-orange-500',
        }

        const categoryData = categoryViews.map((cat) => ({
          name: cat.name,
          views: cat.views,
          count: 0, // We'd need to query destinations to get actual count
          color: categoryColors[cat.name] || 'bg-gray-500',
        }))

        setCategories(categoryData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
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
            <p className="text-3xl font-bold text-gray-800 mb-1">{loading ? '...' : totalDestinations.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Destinations</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{loading ? '...' : totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{loading ? '...' : totalVisits.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Visits</p>
            {!loading && (
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-green-600 font-semibold">{confirmedVisits.toLocaleString()}</span> confirmed • <span className="text-blue-600">{visitIntents.toLocaleString()}</span> intents
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Folder className="text-orange-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{loading ? '...' : categoryCount}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Destinations</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : topDestinations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No views yet</p>
              ) : (
                topDestinations.map((dest, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <MapPin className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{dest.name}</p>
                      <p className="text-sm text-gray-500">{dest.category || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">{dest.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Confirmed Visits */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Most Visited (Confirmed)</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : topConfirmedVisits.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No confirmed visits yet</p>
              ) : (
                topConfirmedVisits.map((dest, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="w-16 h-16 bg-teal-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Users className="text-teal-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{dest.name}</p>
                      <p className="text-sm text-gray-500">{dest.category || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-teal-600">{dest.visits.toLocaleString()} visits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Categories Overview</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No category data yet</p>
              ) : (
                categories.map((cat, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Folder className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.count} destinations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">{cat.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
