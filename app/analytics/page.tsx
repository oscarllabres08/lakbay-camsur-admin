'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, TrendingUp, Loader2, Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  getMostViewedDestinations,
  getMostConfirmedVisits,
  getMostVisitedDestinations,
  getMonthlyTrends,
  getViewsByCategory,
  getVisitBreakdownByCategory,
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
  const [mostConfirmed, setMostConfirmed] = useState<Array<{ name: string; category: string; visits: number }>>([])
  const [mostIntents, setMostIntents] = useState<Array<{ name: string; category: string; intents: number }>>([])
  const [visitorTrends, setVisitorTrends] = useState<Array<{ month: string; views: number; intents: number; confirmed: number }>>([])
  const [categoryViews, setCategoryViews] = useState<Array<{ name: string; value: number; views: number; color: string }>>([])
  const [categoryPerformance, setCategoryPerformance] = useState<Array<{ category: string; views: number; intents: number; confirmed: number }>>([])
  const [loading, setLoading] = useState(true)
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>('month')
  const [exporting, setExporting] = useState(false)
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()) // 0 = Jan

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]

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
        const [viewed, visited, confirmedTop, trends, viewsByCat, visitBreakdownByCat] = await Promise.all([
          getMostViewedDestinations(5),
          getMostVisitedDestinations(5),
          getMostConfirmedVisits(5),
          getMonthlyTrends(6),
          getViewsByCategory(selectedYear, selectedMonth),
          getVisitBreakdownByCategory(selectedYear, selectedMonth),
        ])

        setMostViewed(viewed)
        setMostConfirmed(confirmedTop.map(v => ({ name: v.name, category: v.category, visits: v.visits })))

        // Intents = navigation + maps_view (derived from overall visits aggregation)
        const intentOnly = visited
          .map((v: any) => ({
            name: v.name,
            category: v.category,
            intents: Math.max(0, (v.visits || 0) - (v.confirmed || 0)),
          }))
          .sort((a: any, b: any) => b.intents - a.intents)
          .slice(0, 5)
        setMostIntents(intentOnly)

        // Format monthly trends - use short month names
        const formattedTrends = trends.map(t => ({
          month: t.month.split(' ')[0], // Just the month name (Jan, Feb, etc.)
          views: t.views,
          intents: (t as any).intents || 0,
          confirmed: (t as any).confirmed || 0,
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

        // Create category performance data (union of categories with views or visits)
        const viewsMap = new Map(viewsByCat.map((c: any) => [c.name, c.views]))
        const visitsMap = new Map(visitBreakdownByCat.map((v: any) => [v.name, v]))

        const categories = Array.from(new Set([
          ...Array.from(viewsMap.keys()),
          ...Array.from(visitsMap.keys()),
        ]))

        const performanceData = categories.map((categoryName) => {
          const visitRow: any = visitsMap.get(categoryName) || { intents: 0, confirmed: 0 }
          return {
            category: categoryName,
            views: viewsMap.get(categoryName) || 0,
            intents: visitRow.intents || 0,
            confirmed: visitRow.confirmed || 0,
          }
        })

        setCategoryPerformance(performanceData)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth])

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
            <p className="text-gray-500 mt-1 text-base">Views, visit intents (attempts), and confirmed visits</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Most Confirmed Visits */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Most Confirmed Visits</h3>
                <p className="text-sm text-gray-500">Actual arrivals (geofence confirmed)</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostConfirmed.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No confirmed visits yet</p>
              ) : (
                mostConfirmed.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{dest.name}</p>
                    <p className="text-sm text-gray-500">{dest.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">{dest.visits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">confirmed</p>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Most Visit Intents */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Most Visit Intents</h3>
                <p className="text-sm text-gray-500">Attempts (tap Navigate / Open in Maps)</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostIntents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No intent data yet</p>
              ) : (
                mostIntents.map((dest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{dest.name}</p>
                      <p className="text-sm text-gray-500">{dest.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{dest.intents.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">intents</p>
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
              <p className="text-sm text-gray-500">Monthly views, intents (attempts), and confirmed visits</p>
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
                formatter={(value: any, name: any) => {
                  const map: Record<string, string> = {
                    views: 'Views',
                    intents: 'Visit Intents (Attempts)',
                    confirmed: 'Confirmed Visits',
                  }
                  return [Number(value || 0).toLocaleString(), map[String(name)] || String(name)]
                }}
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
                dataKey="intents"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
                name="Visit Intents (Attempts)"
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: '#14b8a6', r: 4 }}
                name="Confirmed Visits"
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Views by Category</h3>
                  <p className="text-sm text-gray-500">
                    Distribution of views for {monthLabels[selectedMonth]} {selectedYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs sm:text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {monthLabels.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs sm:text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Category Performance</h3>
                  <p className="text-sm text-gray-500">
                    Views vs intents (attempts) vs confirmed visits for {monthLabels[selectedMonth]} {selectedYear}
                  </p>
                </div>
              </div>
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
                  formatter={(value: any, name: any) => {
                    const map: Record<string, string> = {
                      views: 'Views',
                      intents: 'Visit Intents (Attempts)',
                      confirmed: 'Confirmed Visits',
                    }
                    return [Number(value || 0).toLocaleString(), map[String(name)] || String(name)]
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="views" fill="#8b5cf6" name="Views" radius={[8, 8, 0, 0]} />
                <Bar dataKey="intents" fill="#f97316" name="Visit Intents (Attempts)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="confirmed" fill="#14b8a6" name="Confirmed Visits" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
  )
}
