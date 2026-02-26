'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, TrendingUp, Loader2, Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  getMostViewedDestinations,
  getMostVisitedDestinations,
  getMonthlyTrends,
  getViewsByCategory,
  getVisitsByCategory,
  exportDestinationViews,
  exportDestinationVisits,
  exportUserInteractions,
  type ExportPeriod,
} from '@/lib/analytics'

const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#14b8a6']

// Category color mapping
const categoryColors: Record<string, string> = {
  'nature': '#3b82f6',
  'Nature & Adventure': '#3b82f6',
  'food': '#ec4899',
  'Food & Dining': '#ec4899',
  'heritage': '#f97316',
  'Heritage & Culture': '#f97316',
  'resorts': '#14b8a6',
  'Resort & Recreation': '#14b8a6',
}

export default function AnalyticsPage() {
  const [mostViewed, setMostViewed] = useState<Array<{ name: string; category: string; views: number }>>([])
  const [mostVisited, setMostVisited] = useState<Array<{ name: string; category: string; visits: number }>>([])
  const [visitorTrends, setVisitorTrends] = useState<Array<{ month: string; views: number; visits: number }>>([])
  const [categoryViews, setCategoryViews] = useState<Array<{ name: string; value: number; views: number; color: string }>>([])
  const [categoryPerformance, setCategoryPerformance] = useState<Array<{ category: string; views: number; visits: number }>>([])
  const [loading, setLoading] = useState(true)
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>('month')
  const [exporting, setExporting] = useState(false)

  const toCsv = (rows: any[]) => {
    if (!rows || rows.length === 0) return ''

    const headers = Object.keys(rows[0])
    const escape = (value: any) => {
      if (value === null || value === undefined) return ''
      const str = typeof value === 'string' ? value : JSON.stringify(value)
      const escaped = str.replace(/"/g, '""')
      return `"${escaped}"`
    }

    const lines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ]

    return lines.join('\n')
  }

  const downloadCsv = (filename: string, csv: string) => {
    if (!csv) return
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const [views, visits, interactions] = await Promise.all([
        exportDestinationViews(exportPeriod),
        exportDestinationVisits(exportPeriod),
        exportUserInteractions(exportPeriod),
      ])

      const stamp = new Date().toISOString().slice(0, 10)
      downloadCsv(`destination_views_${exportPeriod}_${stamp}.csv`, toCsv(views))
      downloadCsv(`destination_visits_${exportPeriod}_${stamp}.csv`, toCsv(visits))
      downloadCsv(`user_interactions_${exportPeriod}_${stamp}.csv`, toCsv(interactions))
    } catch (error) {
      console.error('Error exporting analytics data:', error)
      alert('Failed to export analytics data. Please check the console for details.')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [viewed, visited, trends, viewsByCat, visitsByCat] = await Promise.all([
          getMostViewedDestinations(5),
          getMostVisitedDestinations(5),
          getMonthlyTrends(6),
          getViewsByCategory(),
          getVisitsByCategory(),
        ])

        setMostViewed(viewed)
        setMostVisited(visited.map(v => ({ name: v.name, category: v.category, visits: v.visits })))

        // Format monthly trends - use short month names
        const formattedTrends = trends.map(t => ({
          month: t.month.split(' ')[0], // Just the month name (Jan, Feb, etc.)
          views: t.views,
          visits: t.visits,
        }))
        setVisitorTrends(formattedTrends.length > 0 ? formattedTrends : [])

        // Calculate category views for pie chart
        const totalViews = viewsByCat.reduce((sum, cat) => sum + cat.views, 0)
        const categoryViewsData = viewsByCat.map(cat => ({
          name: cat.name,
          value: totalViews > 0 ? Math.round((cat.views / totalViews) * 100) : 0,
          views: cat.views,
          color: categoryColors[cat.name] || '#6b7280',
        }))
        setCategoryViews(categoryViewsData)

        // Create category performance data
        const visitsMap = new Map(visitsByCat.map(v => [v.name, v.visits]))
        const performanceData = viewsByCat.map(cat => ({
          category: cat.name,
          views: cat.views,
          visits: visitsMap.get(cat.name) || 0,
        }))
        setCategoryPerformance(performanceData)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary-600 animate-spin" size={32} />
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header + Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Analytics</h2>
            <p className="text-gray-500 mt-1 text-base">Views, visits, and interaction insights</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value as ExportPeriod)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="day">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export CSV
            </button>
          </div>
        </div>
        {/* Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Viewed Destinations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Eye className="text-primary-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Most Viewed Destinations</h3>
                <p className="text-sm text-gray-500">Top performing by views</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostViewed.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No views data yet</p>
              ) : (
                mostViewed.map((dest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{dest.name}</p>
                      <p className="text-sm text-gray-500">{dest.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{dest.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most Visited Destinations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Most Visited Destinations</h3>
                <p className="text-sm text-gray-500">Top performing by visits</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostVisited.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No visits data yet</p>
              ) : (
                mostVisited.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{dest.name}</p>
                    <p className="text-sm text-gray-500">{dest.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">{dest.visits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">visits</p>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Visitor Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Visitor Trends</h3>
              <p className="text-sm text-gray-500">Monthly views and visits over time</p>
            </div>
          </div>
          {visitorTrends.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">No trend data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: '#14b8a6', r: 4 }}
                name="Visits"
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Category - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">Views by Category</h3>
              <p className="text-sm text-gray-500">Distribution of views</p>
            </div>
            {categoryViews.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No category data available yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryViews}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryViews.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryViews.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{cat.views.toLocaleString()} views</span>
                </div>
              ))}
                </div>
              </>
            )}
          </div>

          {/* Category Performance - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">Category Performance</h3>
              <p className="text-sm text-gray-500">Views vs Visits comparison</p>
            </div>
            {categoryPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No performance data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="views" fill="#8b5cf6" name="Views" radius={[8, 8, 0, 0]} />
                <Bar dataKey="visits" fill="#14b8a6" name="Visits" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
  )
}
