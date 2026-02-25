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

const bestTimeOptionsFood = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
]

const bestTimeOptionsNature = [
  { label: 'Morning 8am-10am', value: 'morning' },
  { label: 'Afternoon 3pm-5pm', value: 'late afternoon' },
  { label: 'Evening 6pm onward', value: 'evening' },
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

  // Helper to parse accommodations from various formats
  const parseAccommodations = (acc: any): Accommodation[] => {
    if (!acc) return [];
    if (Array.isArray(acc)) return acc;
    if (typeof acc === 'string') {
      try {
        return JSON.parse(acc);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const initialAccommodations = parseAccommodations(destination?.accommodations);

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
    accommodations: initialAccommodations,
    rating: destination?.rating || undefined,
  })


  // For resort category, bestTimeToVisit is a text input (string)
  // For other categories, it's checkboxes (array)
  const getInitialBestTimeForResort = (): string => {
    if (!destination) {
      // When creating a new resort, default to "Weekdays, Summer"
      return 'Weekdays, Summer';
    }
    // Check if destination category is resorts
    const destCategory = destination.category;
    const isResort = destCategory === 'resorts' || destCategory === 'Resort & Recreation';
    if (!isResort) return '';
    
    // If it's an array, join with comma, otherwise return as string
    if (Array.isArray(destination.bestTimeToVisit)) {
      const joined = destination.bestTimeToVisit.join(', ');
      return joined || 'Weekdays, Summer'; // Default if empty
    }
    const value = typeof destination.bestTimeToVisit === 'string' ? destination.bestTimeToVisit : '';
    return value || 'Weekdays, Summer'; // Default if empty
  }

  const getInitialBestTimeForHeritage = (): string => {
    if (!destination) {
      // When creating a new heritage destination, default to "Anytime"
      return 'Anytime';
    }
    // Check if destination category is heritage
    const destCategory = destination.category;
    const isHeritage = destCategory === 'heritage' || destCategory === 'Heritage & Culture';
    if (!isHeritage) return '';
    
    // If it's an array, join with comma, otherwise return as string
    if (Array.isArray(destination.bestTimeToVisit)) {
      const joined = destination.bestTimeToVisit.join(', ');
      return joined || 'Anytime'; // Default if empty
    }
    const value = typeof destination.bestTimeToVisit === 'string' ? destination.bestTimeToVisit : '';
    return value || 'Anytime'; // Default if empty
  }

  const [resortBestTimeText, setResortBestTimeText] = useState<string>(
    getInitialBestTimeForResort()
  )

  const [heritageBestTimeText, setHeritageBestTimeText] = useState<string>(
    getInitialBestTimeForHeritage()
  )

  // Parse entrance fees for resort category (Day and Night)
  const parseEntranceFees = (costStr: string | undefined): { day: string; night: string } => {
    if (!costStr) return { day: '', night: '' };
    
    // Try to parse format like "Day: ₱50; Night: ₱50" or "Day: 50; Night: 50"
    const dayMatch = costStr.match(/day[^0-9]*₱?\s*(\d+)/i);
    const nightMatch = costStr.match(/night[^0-9]*₱?\s*(\d+)/i);
    
    return {
      day: dayMatch ? dayMatch[1] : '',
      night: nightMatch ? nightMatch[1] : '',
    };
  }

  const initialEntranceFees = parseEntranceFees(destination?.estimatedCost);
  const [resortEntranceFeeDay, setResortEntranceFeeDay] = useState<string>(initialEntranceFees.day);
  const [resortEntranceFeeNight, setResortEntranceFeeNight] = useState<string>(initialEntranceFees.night);
  
  // Parse availability from operatingHours for resorts
  const parseAvailability = (operatingHours: string | undefined): { day: boolean; night: boolean } => {
    if (!operatingHours) return { day: false, night: false };
    const lower = operatingHours.toLowerCase();
    if (lower.includes('24/7') || lower.includes('24 hours') || lower.includes('open 24')) {
      return { day: true, night: true };
    }
    return {
      day: lower.includes('day'),
      night: lower.includes('night'),
    };
  };

  const initialAvailability = parseAvailability(destination?.operatingHours);
  const [resortAvailabilityDay, setResortAvailabilityDay] = useState<boolean>(initialAvailability.day);
  const [resortAvailabilityNight, setResortAvailabilityNight] = useState<boolean>(initialAvailability.night);
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>(
    initialAccommodations
  )

  // Update accommodations when destination changes (for editing)
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setAccommodations([]);
      setResortBestTimeText('');
      setHeritageBestTimeText('');
      setResortEntranceFeeDay('');
      setResortEntranceFeeNight('');
      setResortAvailabilityDay(false);
      setResortAvailabilityNight(false);
      return;
    }
    
    if (destination?.accommodations) {
      // Handle both JSON string and array formats
      const parsedAccommodations = parseAccommodations(destination.accommodations);
      setAccommodations(parsedAccommodations);
    } else {
      setAccommodations([]);
    }

    // Update resort best time text and entrance fees when destination changes
    if (destination) {
      const destCategory = destination.category;
      const isResort = destCategory === 'resorts' || destCategory === 'Resort & Recreation';
      const isHeritage = destCategory === 'heritage' || destCategory === 'Heritage & Culture';
      
      if (isResort) {
        if (Array.isArray(destination.bestTimeToVisit)) {
          const joined = destination.bestTimeToVisit.join(', ');
          setResortBestTimeText(joined || 'Weekdays, Summer');
        } else if (typeof destination.bestTimeToVisit === 'string') {
          setResortBestTimeText(destination.bestTimeToVisit || 'Weekdays, Summer');
        } else {
          setResortBestTimeText('Weekdays, Summer');
        }
        // Parse entrance fees
        const fees = parseEntranceFees(destination.estimatedCost);
        setResortEntranceFeeDay(fees.day);
        setResortEntranceFeeNight(fees.night);
        // Parse availability
        const availability = parseAvailability(destination.operatingHours);
        setResortAvailabilityDay(availability.day);
        setResortAvailabilityNight(availability.night);
        setHeritageBestTimeText('');
      } else if (isHeritage) {
        if (Array.isArray(destination.bestTimeToVisit)) {
          const joined = destination.bestTimeToVisit.join(', ');
          setHeritageBestTimeText(joined || 'Anytime');
        } else if (typeof destination.bestTimeToVisit === 'string') {
          setHeritageBestTimeText(destination.bestTimeToVisit || 'Anytime');
        } else {
          setHeritageBestTimeText('Anytime');
        }
        setResortBestTimeText('');
        setResortEntranceFeeDay('');
        setResortEntranceFeeNight('');
      } else {
        setResortBestTimeText('');
        setHeritageBestTimeText('');
        setResortEntranceFeeDay('');
        setResortEntranceFeeNight('');
      }
    } else {
      // When creating a new destination, set defaults based on category
      if (formData.category === 'resorts') {
        setResortBestTimeText('Weekdays, Summer');
        setHeritageBestTimeText('');
        setResortEntranceFeeDay('');
        setResortEntranceFeeNight('');
        setResortAvailabilityDay(true);
        setResortAvailabilityNight(true);
      } else if (formData.category === 'heritage') {
        setHeritageBestTimeText('Anytime');
        setResortBestTimeText('');
        setResortEntranceFeeDay('');
        setResortEntranceFeeNight('');
      } else {
        setResortBestTimeText('');
        setHeritageBestTimeText('');
        setResortEntranceFeeDay('');
        setResortEntranceFeeNight('');
        setResortAvailabilityDay(false);
        setResortAvailabilityNight(false);
      }
    }
  }, [destination, isOpen])

  // Set default or clear best time text and entrance fees when category changes
  useEffect(() => {
    if (formData.category === 'resorts') {
      // When switching to resort category, set default if empty
      if (!resortBestTimeText && !destination) {
        setResortBestTimeText('Weekdays, Summer');
      }
      // Default to both day and night when creating new resort
      if (!destination && !resortAvailabilityDay && !resortAvailabilityNight) {
        setResortAvailabilityDay(true);
        setResortAvailabilityNight(true);
      }
      setHeritageBestTimeText('');
    } else if (formData.category === 'heritage') {
      // When switching to heritage category, set default if empty
      if (!heritageBestTimeText && !destination) {
        setHeritageBestTimeText('Anytime');
      }
      setResortBestTimeText('');
      setResortEntranceFeeDay('');
      setResortEntranceFeeNight('');
      setResortAvailabilityDay(false);
      setResortAvailabilityNight(false);
    } else {
      // Clear when switching away from resorts or heritage
      if (resortBestTimeText) setResortBestTimeText('');
      if (heritageBestTimeText) setHeritageBestTimeText('');
      if (resortEntranceFeeDay) setResortEntranceFeeDay('');
      if (resortEntranceFeeNight) setResortEntranceFeeNight('');
      setResortAvailabilityDay(false);
      setResortAvailabilityNight(false);
    }
  }, [formData.category])

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

      // For resort and heritage categories, use text input value; for others, use checkbox array
      let bestTimeToVisitValue: string[] | null = null;
      if (categoryValue === 'resorts') {
        // For resorts, convert text input to array (split by comma if multiple values)
        if (resortBestTimeText.trim()) {
          bestTimeToVisitValue = resortBestTimeText.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (categoryValue === 'heritage') {
        // For heritage, convert text input to array (split by comma if multiple values)
        if (heritageBestTimeText.trim()) {
          bestTimeToVisitValue = heritageBestTimeText.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else {
        // For other categories (food, nature), use checkbox selections
        bestTimeToVisitValue = formData.bestTimeToVisit.length > 0 ? formData.bestTimeToVisit : null;
      }

      // Format operating hours for resorts based on availability
      let operatingHoursValue: string;
      if (categoryValue === 'resorts') {
        if (resortAvailabilityDay && resortAvailabilityNight) {
          operatingHoursValue = '24/7';
        } else if (resortAvailabilityDay) {
          operatingHoursValue = 'Day Only';
        } else if (resortAvailabilityNight) {
          operatingHoursValue = 'Night Only';
        } else {
          alert('Please select at least one availability option (Day or Night)');
          setSaving(false);
          return;
        }
      } else {
        operatingHoursValue = formData.operatingHours;
      }

      // Prepare data for Supabase
      const destinationData: any = {
        name: formData.name,
        category: categoryValue,
        description: formData.description || null,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        operating_hours: operatingHoursValue,
        best_time_to_visit: bestTimeToVisitValue,
        estimated_cost: categoryValue === 'resorts' 
          ? (resortEntranceFeeDay.trim() && resortEntranceFeeNight.trim()
              ? `Day: ₱${resortEntranceFeeDay.trim()}; Night: ₱${resortEntranceFeeNight.trim()}`
              : resortEntranceFeeDay.trim()
              ? `Day: ₱${resortEntranceFeeDay.trim()}`
              : resortEntranceFeeNight.trim()
              ? `Night: ₱${resortEntranceFeeNight.trim()}`
              : '')
          : formData.estimatedCost,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
                placeholder="123.1857"
                required
              />
            </div>
          </div>

          {/* Operating Hours / Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.category === 'resorts' ? 'Availability *' : 'Operating Hours *'}
            </label>
            {formData.category === 'resorts' ? (
              // For resort category: checkboxes for Day and Night
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resortAvailabilityDay}
                    onChange={(e) => setResortAvailabilityDay(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Day</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resortAvailabilityNight}
                    onChange={(e) => setResortAvailabilityNight(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Night</span>
                </label>
                {!resortAvailabilityDay && !resortAvailabilityNight && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one option</p>
                )}
              </div>
            ) : (
              // For other categories: text input
              <input
                type="text"
                value={formData.operatingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
                placeholder="e.g., 7:00 AM - 10:00 PM (Daily)"
                required
              />
            )}
          </div>

          {/* Best Time to Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Time to Visit *
            </label>
            {formData.category === 'resorts' ? (
              // For resort category: text input
              <input
                type="text"
                value={resortBestTimeText}
                onChange={(e) => setResortBestTimeText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
                placeholder="e.g., Summer, Dry Season, All Year Round"
                required
              />
            ) : formData.category === 'heritage' ? (
              // For heritage category: text input
              <input
                type="text"
                value={heritageBestTimeText}
                onChange={(e) => setHeritageBestTimeText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
                placeholder="e.g., Anytime, Morning, Afternoon"
                required
              />
            ) : formData.category === 'nature' ? (
              // For nature category: checkboxes with time periods
              <div className="space-y-2">
                {bestTimeOptionsNature.map(option => (
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
            ) : (
              // For food category: checkboxes with meal times
              <div className="space-y-2">
                {bestTimeOptionsFood.map(option => (
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
            )}
          </div>

          {/* Entrance / Estimated Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.category === 'food'
                ? 'Estimated Cost per Person *'
                : 'Entrance / Experience Fee *'}
            </label>
            {formData.category === 'resorts' ? (
              // For resort category: separate Day and Night fields
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Day Entrance Fee *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">₱</span>
                    <input
                      type="text"
                      value={resortEntranceFeeDay}
                      onChange={(e) => {
                        // Allow only numbers
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        setResortEntranceFeeDay(numericValue);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., 50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Night Entrance Fee *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">₱</span>
                    <input
                      type="text"
                      value={resortEntranceFeeNight}
                      onChange={(e) => {
                        // Allow only numbers
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        setResortEntranceFeeNight(numericValue);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., 50"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              // For other categories: single text input
              <div>
                <input
                  type="text"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base"
                  placeholder={
                    formData.category === 'food'
                      ? 'e.g., ₱100-200 per person'
                      : 'e.g., ₱50 entrance per person or ₱50-100 per person'
                  }
                  required
                />
                {/* Helper text for Food & Dining with format examples */}
                {formData.category === 'food' && (
                  <p className="mt-2 text-xs text-gray-500">
                    Accepted formats: <span className="font-mono">₱100-200 per person</span>, <span className="font-mono">100-200</span>, <span className="font-mono">100 to 200</span>, or <span className="font-mono">100</span> (single price). "per person" is optional and will be automatically ignored by the parser.
                  </p>
                )}
              </div>
            )}
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
