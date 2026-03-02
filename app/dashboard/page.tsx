'use client'

import React, { useEffect, useState } from 'react'
import { MapPin, Eye, Users, Folder } from 'lucide-react'

// Category icon and color mapping (matching mobile app)
const getCategoryIcon = (categoryName: string): string => {
  const cat = categoryName.toLowerCase();
  if (cat.includes('nature')) return '🏞️';
  if (cat.includes('food')) return '🍽️';
  if (cat.includes('heritage')) return '🏛️';
  if (cat.includes('resort')) return '🏖️';
  return '📁';
};

const getCategoryGradient = (categoryName: string): string => {
  const cat = categoryName.toLowerCase();
  if (cat.includes('nature')) return 'from-[#2F6F4E] via-[#6BCB77] to-[#A3E635]';
  if (cat.includes('food')) return 'from-[#C44536] via-[#FF8C42] to-[#FFD166]';
  if (cat.includes('heritage')) return 'from-[#7A5C3E] via-[#C6A969] to-[#E6C78B]';
  if (cat.includes('resort')) return 'from-[#1A759F] via-[#34A0A4] to-[#76C893]';
  return 'from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]';
};
import {
  getTotalDestinations,
  getTotalViews,
  getViewsToday,
  getViewsThisWeek,
  getViewsThisMonth,
  getTotalVisits,
  getConfirmedVisits,
  getVisitIntents,
  getCategoryCount,
  getMostViewedDestinations,
  getMostConfirmedVisits,
  getCategoryStatistics,
} from '@/lib/analytics'

export default function DashboardPage() {
  const [totalDestinations, setTotalDestinations] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [viewsToday, setViewsToday] = useState(0)
  const [viewsThisWeek, setViewsThisWeek] = useState(0)
  const [viewsThisMonth, setViewsThisMonth] = useState(0)
  const [totalVisits, setTotalVisits] = useState(0)
  const [confirmedVisits, setConfirmedVisits] = useState(0)
  const [visitIntents, setVisitIntents] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [topDestinations, setTopDestinations] = useState<Array<{ name: string; category: string; municipality: string; views: number; image_url: string | null }>>([])
  const [topConfirmedVisits, setTopConfirmedVisits] = useState<Array<{ name: string; category: string; municipality: string; visits: number; image_url: string | null }>>([])
  const [categories, setCategories] = useState<Array<{ name: string; views: number; count: number; color: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          destinations,
          views,
          todayViews,
          weekViews,
          monthViews,
          visits,
          confirmed,
          intents,
          categories,
          topDests,
          topConfirmed,
          categoryStats,
        ] = await Promise.all([
          getTotalDestinations(),
          getTotalViews(),
          getViewsToday(),
          getViewsThisWeek(),
          getViewsThisMonth(),
          getTotalVisits(),
          getConfirmedVisits(),
          getVisitIntents(),
          getCategoryCount(),
          getMostViewedDestinations(5),
          getMostConfirmedVisits(5),
          getCategoryStatistics(),
        ])

        setTotalDestinations(destinations)
        setTotalViews(views)
        setViewsToday(todayViews)
        setViewsThisWeek(weekViews)
        setViewsThisMonth(monthViews)
        setTotalVisits(visits)
        setConfirmedVisits(confirmed)
        setVisitIntents(intents)
        setCategoryCount(categories)
        setTopDestinations(topDests)
        setTopConfirmedVisits(topConfirmed)

        // Map category statistics to display format
        const categoryData = categoryStats.map((cat) => ({
          name: cat.name,
          views: cat.totalViews,
          count: cat.destinations, // Actual destination count from database
          color: 'bg-gray-500', // Not used anymore since we use gradients
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
    <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 hover:shadow-xl transition-all duration-300 hover:border-[#2EC4B6]/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="text-white" size={26} />
              </div>
              <span className="text-xs font-bold text-[#10B981] bg-[#D1FAE5] px-3 py-1.5 rounded-full">+12%</span>
            </div>
            <p className="text-4xl font-black text-[#0F172A] mb-2 font-poppins">{loading ? '...' : totalDestinations.toLocaleString()}</p>
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Total Destinations</p>
          </div>

          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 hover:shadow-xl transition-all duration-300 hover:border-[#2EC4B6]/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Eye className="text-white" size={26} />
              </div>
            </div>
            <p className="text-4xl font-black text-[#0F172A] mb-2 font-poppins">{loading ? '...' : totalViews.toLocaleString()}</p>
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-3">Total Views</p>
            {!loading && (
              <div className="mt-3 text-xs text-[#475569] space-y-1.5 font-medium">
                <p>
                  <span className="font-bold text-[#0F4C5C]">{viewsToday.toLocaleString()}</span> today
                </p>
                <p>
                  <span className="font-bold text-[#2EC4B6]">{viewsThisWeek.toLocaleString()}</span> this week
                </p>
                <p>
                  <span className="font-bold text-[#06B6D4]">{viewsThisMonth.toLocaleString()}</span> this month
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 hover:shadow-xl transition-all duration-300 hover:border-[#2EC4B6]/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="text-white" size={26} />
              </div>
            </div>
            <p className="text-4xl font-black text-[#0F172A] mb-2 font-poppins">{loading ? '...' : totalVisits.toLocaleString()}</p>
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-3">Total Visits</p>
            {!loading && (
              <div className="mt-3 text-xs text-[#475569] font-medium">
                <span className="text-[#10B981] font-bold">{confirmedVisits.toLocaleString()}</span> confirmed • <span className="text-[#2EC4B6] font-bold">{visitIntents.toLocaleString()}</span> intents
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 hover:shadow-xl transition-all duration-300 hover:border-[#2EC4B6]/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#EC4899] to-[#A855F7] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Folder className="text-white" size={26} />
              </div>
            </div>
            <p className="text-4xl font-black text-[#0F172A] mb-2 font-poppins">{loading ? '...' : categoryCount}</p>
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Categories</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-6 font-poppins">Top Destinations</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-[#64748B] text-center py-8 font-medium">Loading...</p>
              ) : topDestinations.length === 0 ? (
                <p className="text-[#64748B] text-center py-8 font-medium">No views yet</p>
              ) : (
                topDestinations.map((dest, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-[#0F4C5C]/5 hover:to-[#2EC4B6]/5 rounded-xl transition-all duration-200 border border-transparent hover:border-[#2EC4B6]/20">
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden shadow-md bg-gradient-to-br from-[#0F4C5C] to-[#2EC4B6] relative">
                      {dest.image_url ? (
                        <>
                          <img
                            src={dest.image_url}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center absolute inset-0">
                            <MapPin className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="text-white" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F172A] text-base">{dest.name}</p>
                      <p className="text-sm text-[#64748B] font-medium">{dest.category || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0F4C5C]">{dest.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Confirmed Visits */}
          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-6 font-poppins">Most Visited (Confirmed)</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-[#64748B] text-center py-8 font-medium">Loading...</p>
              ) : topConfirmedVisits.length === 0 ? (
                <p className="text-[#64748B] text-center py-8 font-medium">No confirmed visits yet</p>
              ) : (
                topConfirmedVisits.map((dest, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-[#2EC4B6]/5 hover:to-[#06B6D4]/5 rounded-xl transition-all duration-200 border border-transparent hover:border-[#2EC4B6]/20">
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden shadow-md bg-gradient-to-br from-[#2EC4B6] to-[#06B6D4] relative">
                      {dest.image_url ? (
                        <>
                          <img
                            src={dest.image_url}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center absolute inset-0">
                            <Users className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="text-white" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F172A] text-base">{dest.name}</p>
                      <p className="text-sm text-[#64748B] font-medium">{dest.category || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#2EC4B6]">{dest.visits.toLocaleString()} visits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl shadow-lg p-7 border-2 border-[#2EC4B6]/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>
          <h2 className="text-2xl font-black text-[#0F172A] mb-6 font-poppins">Categories Overview</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-[#64748B] text-center py-8 font-medium">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-[#64748B] text-center py-8 font-medium">No category data yet</p>
              ) : (
                categories.map((cat, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-[#0F4C5C]/5 hover:to-[#2EC4B6]/5 rounded-xl transition-all duration-200 border border-transparent hover:border-[#2EC4B6]/20">
                    <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryGradient(cat.name)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-2xl">{getCategoryIcon(cat.name)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F172A] text-base capitalize">{cat.name}</p>
                      <p className="text-sm text-[#64748B] font-medium">{cat.count} destinations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0F4C5C]">{cat.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      
  )
}
