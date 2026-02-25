'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Plus, Search, Edit, Trash2, MapPin, Eye, Users, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import AddDestinationModal from '@/components/AddDestinationModal'
import { supabase } from '@/lib/supabase'

interface Accommodation {
  type: string
  capacity: string
  price?: number
}

interface Destination {
  id: string
  name: string
  category: string
  description: string
  location: string
  latitude: number
  longitude: number
  operating_hours: string
  best_time_to_visit: string[]
  estimated_cost: string
  image_url: string | null
  views: number
  visits: number
  popularity: number
  accommodations?: Accommodation[]
}

const categoryLabels: Record<string, string> = {
  'nature': 'Nature & Adventure',
  'food': 'Food & Dining',
  'heritage': 'Heritage & Culture',
  'resorts': 'Resort & Recreation',
}

const categories = ['All', 'Nature & Adventure', 'Food & Dining', 'Heritage & Culture', 'Resort & Recreation']
const municipalities = ['All', 'Naga', 'Pili', 'Libmanan']

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMunicipality, setSelectedMunicipality] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [expandedAccommodations, setExpandedAccommodations] = useState<Set<string>>(new Set())

  // Fetch destinations from Supabase
  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setDestinations(data || [])
    } catch (error: any) {
      console.error('Error fetching destinations:', error)
      alert('Failed to load destinations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase())
    const categoryLabel = categoryLabels[dest.category] || dest.category
    const matchesCategory = selectedCategory === 'All' || categoryLabel === selectedCategory
    const matchesMunicipality = selectedMunicipality === 'All' || dest.location === selectedMunicipality
    return matchesSearch && matchesCategory && matchesMunicipality
  })

  const handleAddDestination = async () => {
    await fetchDestinations()
    setIsModalOpen(false)
  }

  const handleEditDestination = async () => {
    await fetchDestinations()
    setIsModalOpen(false)
    setEditingDestination(null)
  }

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return

    try {
      // Get destination to delete image
      const dest = destinations.find(d => d.id === id)
      
      // Delete from database
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Delete image from storage if exists
      if (dest?.image_url) {
        try {
          const urlParts = dest.image_url.split('/')
          const filePath = urlParts[urlParts.length - 1]
          await supabase.storage
            .from('destination-images')
            .remove([filePath])
        } catch (imgError) {
          console.error('Error deleting image:', imgError)
          // Don't block deletion if image delete fails
        }
      }

      await fetchDestinations()
    } catch (error: any) {
      console.error('Error deleting destination:', error)
      alert('Failed to delete destination: ' + error.message)
    }
  }

  const openEditModal = (dest: Destination) => {
    // Convert database format to form format
    // Keep category as value (nature, food, etc.) - modal handles display
    // Convert popularity (0-1) back to rating (0-5) for display, keep decimal precision
    const rating = dest.popularity ? parseFloat((dest.popularity * 5).toFixed(1)) : undefined;
    
    // Parse accommodations if it's a JSON string
    let accommodations = dest.accommodations || [];
    if (typeof accommodations === 'string') {
      try {
        accommodations = JSON.parse(accommodations);
      } catch (e) {
        accommodations = [];
      }
    }
    
    const formData: any = {
      id: dest.id,
      name: dest.name,
      category: dest.category, // Keep as value, not label
      description: dest.description || '',
      location: dest.location,
      latitude: dest.latitude,
      longitude: dest.longitude,
      operatingHours: dest.operating_hours || '',
      bestTimeToVisit: dest.best_time_to_visit || [],
      estimatedCost: dest.estimated_cost || '',
      image_url: dest.image_url || '',
      accommodations: accommodations,
      rating: rating,
    }
    setEditingDestination(formData)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDestination(null)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Manage Destinations</h2>
            <p className="text-gray-500 mt-1 text-base">Add, edit, and manage destination information</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl w-full sm:w-auto text-base"
          >
            <Plus size={20} />
            Add Destination
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Municipality</label>
                <div className="flex gap-2 flex-wrap">
                  {municipalities.map((mun) => (
                    <button
                      key={mun}
                      onClick={() => setSelectedMunicipality(mun)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedMunicipality === mun
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mun}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Loader2 className="animate-spin mx-auto text-primary-600 mb-4" size={32} />
            <p className="text-gray-500">Loading destinations...</p>
          </div>
        ) : (
          <>
            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredDestinations.map((dest) => {
                const categoryLabel = categoryLabels[dest.category] || dest.category
                return (
                  <div key={dest.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200">
                    <div className="relative h-48 bg-gray-200">
                      {dest.image_url ? (
                        <img
                          src={dest.image_url}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23e5e7eb" width="400" height="250"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E${encodeURIComponent(dest.name)}%3C/text%3E%3C/svg%3E`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="text-gray-400" size={48} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {categoryLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">{dest.name}</h3>
                      <p className="text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">{dest.description || 'No description'}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span>{dest.location} - {dest.latitude}, {dest.longitude}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye size={16} />
                            <span>{dest.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users size={16} />
                            <span>{dest.visits || 0} visits</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Accommodations Section */}
                      {(() => {
                        let accommodations: Accommodation[] = [];
                        if (dest.accommodations) {
                          if (typeof dest.accommodations === 'string') {
                            try {
                              accommodations = JSON.parse(dest.accommodations);
                            } catch (e) {
                              accommodations = [];
                            }
                          } else if (Array.isArray(dest.accommodations)) {
                            accommodations = dest.accommodations;
                          }
                        }
                        
                        if (accommodations.length > 0) {
                          const isExpanded = expandedAccommodations.has(dest.id);
                          
                          return (
                            <div className="mb-4 bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedAccommodations);
                                  if (isExpanded) {
                                    newExpanded.delete(dest.id);
                                  } else {
                                    newExpanded.add(dest.id);
                                  }
                                  setExpandedAccommodations(newExpanded);
                                }}
                                className="w-full p-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
                              >
                                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="text-blue-600">🏠</span>
                                  Cottages & Accommodations
                                  <span className="text-xs font-normal text-gray-500">
                                    ({accommodations.length} {accommodations.length === 1 ? 'item' : 'items'})
                                  </span>
                                </h4>
                                {isExpanded ? (
                                  <ChevronUp size={18} className="text-gray-600" />
                                ) : (
                                  <ChevronDown size={18} className="text-gray-600" />
                                )}
                              </button>
                              {isExpanded && (
                                <div className="px-3 pb-3 space-y-2">
                                  {accommodations.map((acc, idx) => (
                                    <div key={idx} className="bg-white rounded-md p-2 border border-blue-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-gray-800">{acc.type}</p>
                                          <p className="text-xs text-gray-500">{acc.capacity}</p>
                                        </div>
                                        {acc.price && (
                                          <p className="text-sm font-bold text-blue-600">₱{acc.price}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(dest)}
                          className="flex-1 bg-primary-50 text-primary-600 hover:bg-primary-100 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(dest.id)}
                          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredDestinations.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500">No destinations found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddDestinationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingDestination ? handleEditDestination : handleAddDestination}
          destination={editingDestination as any}
        />
      )}
    </Layout>
  )
}
