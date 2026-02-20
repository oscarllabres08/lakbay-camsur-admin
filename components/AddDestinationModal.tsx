'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '@/lib/supabase'

interface Accommodation {
  type: string
  capacity: string
  price?: number
}

interface Destination {
  id?: string
  name: string
  category: string
  description: string
  latitude: number
  longitude: number
  operatingHours: string
  bestTimeToVisit: string[]
  estimatedCost: string
  image_url?: string
  location: string
  accommodations?: Accommodation[]
  rating?: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (destination: Destination) => void
  destination?: Destination | null
}

const categories = [
  { label: 'Nature & Adventure', value: 'nature' },
  { label: 'Food & Dining', value: 'food' },
  { label: 'Heritage & Culture', value: 'heritage' },
  { label: 'Resort & Recreation', value: 'resorts' },
]

const municipalities = ['Naga', 'Pili', 'Libmanan']

// Helper to get category value from label
const getCategoryValue = (label: string): string => {
  const cat = categories.find(c => c.label === label)
  return cat ? cat.value : label
}

// Helper to get category label from value
const getCategoryLabel = (value: string): string => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

const bestTimeOptions = [
  { label: 'Morning (8-10 AM)', value: 'morning' },
  { label: 'Afternoon (3-5 PM)', value: 'afternoon' },
  { label: 'Evening (6 PM onward)', value: 'evening' },
]

const accommodationTypes = [
  'Small Kubo',
  'Big Kubo',
  'Table w/ Umbrella',
  'Cottage',
  'Big Cottage',
  'Umbrella Type',
  'Umbrella and Chair',
  'Umbrella w/ Table',
  'Tent',
  'Big Tent',
  'Gazebo Round Table',
]

export default function AddDestinationModal({ isOpen, onClose, onSave, destination }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize form data - handle both database format and form format
  const getInitialCategory = () => {
    if (!destination) return categories[0].value
    // If destination has category value (from DB), use it
    if (destination.category && ['nature', 'food', 'heritage', 'resorts'].includes(destination.category)) {
      return destination.category
    }
    // If destination has category label (from form), convert to value
    return getCategoryValue(destination.category) || categories[0].value
  }

  const [formData, setFormData] = useState<Destination>({
    name: destination?.name || '',
    category: getInitialCategory(),
    description: destination?.description || '',
    location: destination?.location || municipalities[0],
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0,
    operatingHours: destination?.operatingHours || '',
    bestTimeToVisit: destination?.bestTimeToVisit || [],
    estimatedCost: destination?.estimatedCost || '',
    image_url: destination?.image_url || '',
    accommodations: destination?.accommodations || [],
    rating: destination?.rating || undefined,
  })
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>(
    destination?.accommodations || []
  )

  // Update accommodations when destination changes (for editing)
  useEffect(() => {
    if (destination?.accommodations) {
      setAccommodations(destination.accommodations)
    } else {
      setAccommodations([])
    }
  }, [destination])

  const [imagePreview, setImagePreview] = useState<string | null>(destination?.image_url || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removingImage, setRemovingImage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Handle file selection from device
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image: ' + error.message)
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  // Remove old image from storage (when editing)
  const deleteImage = async (imageUrl: string) => {
    try {
      // Only delete if it's from Supabase Storage (contains the bucket name)
      if (imageUrl.includes(STORAGE_BUCKET) || imageUrl.includes('supabase.co')) {
        // Extract file path from URL
        const urlParts = imageUrl.split('/')
        const filePath = urlParts[urlParts.length - 1].split('?')[0] // Remove query params
        
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath])
      }
    } catch (error) {
      console.error('Delete image error:', error)
      // Don't show error to user, just log it
    }
  }

  // Handle removing existing photo
  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove this photo? You can upload a new one after saving.')) {
      return
    }

    setRemovingImage(true)
    try {
      // If editing and has existing image, delete from storage
      if (destination?.image_url) {
        await deleteImage(destination.image_url)
      }
      
      // Clear preview and form data
      setImagePreview(null)
      setSelectedFile(null)
      setFormData(prev => ({ ...prev, image_url: '' }))
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      alert('Failed to remove photo. Please try again.')
    } finally {
      setRemovingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl: string | null = formData.image_url || null

      // Upload new image if selected
      if (selectedFile) {
        // Delete old image if editing
        if (destination?.image_url) {
          await deleteImage(destination.image_url)
        }

        const uploadedUrl = await uploadImage(selectedFile)
        if (!uploadedUrl) {
          setSaving(false)
          return
        }
        imageUrl = uploadedUrl
      } else if (formData.image_url === '' && destination?.image_url) {
        // If image was removed (cleared), delete old image from storage
        await deleteImage(destination.image_url)
        imageUrl = null
      }

      // Category is already in value format (nature, food, etc.)
      const categoryValue = formData.category

      // Prepare data for Supabase
      const destinationData: any = {
        name: formData.name,
        category: categoryValue,
        description: formData.description || null,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        operating_hours: formData.operatingHours,
        best_time_to_visit: formData.bestTimeToVisit.length > 0 ? formData.bestTimeToVisit : null,
        estimated_cost: formData.estimatedCost,
        image_url: imageUrl || null,
        accommodations: categoryValue === 'resorts' && accommodations.length > 0 ? JSON.stringify(accommodations) : null,
        // Convert rating (1-5) to popularity (0-1) for database
        popularity: formData.rating ? formData.rating / 5 : null,
      }

      if (destination?.id) {
        // Update existing destination
        const { error } = await supabase
          .from('destinations')
          .update(destinationData)
          .eq('id', destination.id)

        if (error) throw error
      } else {
        // Insert new destination
        const { error } = await supabase
          .from('destinations')
          .insert([destinationData])

        if (error) throw error
      }

      // Call onSave callback with updated data
      onSave({ ...formData, image_url: imageUrl || undefined, accommodations, id: destination?.id })
    } catch (error: any) {
      console.error('Save error:', error)
      alert('Failed to save destination: ' + (error.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleTimeToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      bestTimeToVisit: prev.bestTimeToVisit.includes(value)
        ? prev.bestTimeToVisit.filter(t => t !== value)
        : [...prev.bestTimeToVisit, value]
    }))
  }

  const handleAddAccommodation = () => {
    setAccommodations([...accommodations, { type: '', capacity: '', price: undefined }])
  }

  const handleRemoveAccommodation = (index: number) => {
    setAccommodations(accommodations.filter((_, i) => i !== index))
  }

  const handleAccommodationChange = (index: number, field: keyof Accommodation, value: string | number | undefined) => {
    const updated = accommodations.map((acc, i) => 
      i === index ? { ...acc, [field]: value } : acc
    )
    setAccommodations(updated)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload - Device File Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition hover:border-primary-400 hover:bg-gray-50"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <div className="mt-4 flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemovePhoto()
                      }}
                      disabled={removingImage}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {removingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Removing...
                        </>
                      ) : (
                        'Remove Photo'
                      )}
                    </button>
                  </div>
                  {uploading && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600 mb-1 font-medium">Click to select image from device</p>
                  <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    <Upload size={16} className="inline mr-2" />
                    Choose Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Municipality/Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Municipality *
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            >
              {municipalities.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., Poro Beach"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Describe the destination..."
              required
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="text"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="13.6233"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="text"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="123.1857"
                required
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operating Hours *
            </label>
            <input
              type="text"
              value={formData.operatingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., 7:00 AM - 10:00 PM (Daily)"
              required
            />
          </div>

          {/* Best Time to Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Time to Visit *
            </label>
            <div className="space-y-2">
              {bestTimeOptions.map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bestTimeToVisit.includes(option.value)}
                    onChange={() => handleTimeToggle(option.value)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Cost *
            </label>
            <input
              type="text"
              value={formData.estimatedCost}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., ₱50-100 per person"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (Stars) *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    rating: value ? parseFloat(value) : undefined 
                  }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-32"
                placeholder="e.g., 4.9"
                required
              />
              <span className="text-sm text-gray-500">/ 5</span>
              {formData.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = formData.rating!;
                    const isFull = star <= Math.floor(rating);
                    const isHalf = !isFull && star - 1 < rating && rating < star;
                    return (
                      <span key={star} className="text-2xl relative">
                        {isFull ? (
                          <span className="text-yellow-400">★</span>
                        ) : isHalf ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </span>
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-600">({formData.rating}/5)</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter a rating from 0 to 5 (e.g., 4.9, 3.5, 5.0)</p>
          </div>

          {/* Accommodations & Cottages - Only for Resorts */}
          {formData.category === 'resorts' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Accommodations & Cottages
                </label>
                <button
                  type="button"
                  onClick={handleAddAccommodation}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus size={16} />
                  Add Accommodation
                </button>
              </div>
              
              {accommodations.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No accommodations added yet. Click "Add Accommodation" to add one.</p>
              ) : (
                <div className="space-y-4">
                  {accommodations.map((acc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Accommodation #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccommodation(index)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Type *
                          </label>
                          <select
                            value={acc.type}
                            onChange={(e) => handleAccommodationChange(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            required
                          >
                            <option value="">Select type...</option>
                            {accommodationTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Capacity (PAX) *
                          </label>
                          <input
                            type="text"
                            value={acc.capacity}
                            onChange={(e) => handleAccommodationChange(index, 'capacity', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="e.g., 2-6 PAX"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price (₱) <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          value={acc.price || ''}
                          onChange={(e) => handleAccommodationChange(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="e.g., 500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {destination ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                destination ? 'Update Destination' : 'Add Destination'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
