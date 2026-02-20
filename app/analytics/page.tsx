'use client'

import Layout from '@/components/Layout'
import { Eye, Users, TrendingUp } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock analytics data
const mostViewed = [
  { name: 'CWC Watersports Complex', category: 'Resort & Recreation', views: 2134 },
  { name: 'Bicolano Delicacies Tour', category: 'Food & Dining', views: 1678 },
  { name: 'Naga Metropolitan Cathedral', category: 'Heritage & Culture', views: 1456 },
  { name: 'Caramoan Islands', category: 'Nature & Adventure', views: 1245 },
  { name: 'Mt. Isarog National Park', category: 'Nature & Adventure', views: 987 },
]

const mostVisited = [
  { name: 'CWC Watersports Complex', category: 'Resort & Recreation', visits: 1567 },
  { name: 'Bicolano Delicacies Tour', category: 'Food & Dining', visits: 1234 },
  { name: 'Naga Metropolitan Cathedral', category: 'Heritage & Culture', visits: 1123 },
  { name: 'Caramoan Islands', category: 'Nature & Adventure', visits: 890 },
  { name: 'Mt. Isarog National Park', category: 'Nature & Adventure', visits: 654 },
]

const visitorTrends = [
  { month: 'Jan', views: 1400, visits: 1000 },
  { month: 'Feb', views: 1800, visits: 1200 },
  { month: 'Mar', views: 2200, visits: 1400 },
  { month: 'Apr', views: 2400, visits: 1600 },
  { month: 'May', views: 2600, visits: 1800 },
  { month: 'Jun', views: 2500, visits: 2000 },
]

const categoryViews = [
  { name: 'Nature & Adventure', value: 30, views: 2232, color: '#3b82f6' },
  { name: 'Resort & Recreation', value: 28, views: 2134, color: '#14b8a6' },
  { name: 'Food & Dining', value: 22, views: 1678, color: '#ec4899' },
  { name: 'Heritage & Culture', value: 19, views: 1456, color: '#f97316' },
]

const categoryPerformance = [
  { category: 'Nature & Adventure', views: 2232, visits: 1544 },
  { category: 'Food & Dining', views: 1678, visits: 1234 },
  { category: 'Heritage & Culture', views: 1456, visits: 1123 },
  { category: 'Resort & Recreation', views: 2134, visits: 1567 },
]

const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#14b8a6']

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="space-y-6">
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
              {mostViewed.map((dest, index) => (
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
              ))}
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
              {mostVisited.map((dest, index) => (
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
              ))}
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
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Category - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">Views by Category</h3>
              <p className="text-sm text-gray-500">Distribution of views</p>
            </div>
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
          </div>

          {/* Category Performance - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">Category Performance</h3>
              <p className="text-sm text-gray-500">Views vs Visits comparison</p>
            </div>
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
          </div>
        </div>
      </div>
    </Layout>
  )
}
