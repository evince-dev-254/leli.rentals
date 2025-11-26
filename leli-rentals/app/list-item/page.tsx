'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload'
import { listingsServiceSupabase, ListingData } from '@/lib/listings-service-supabase'
import { isSupabaseConfigured } from '@/lib/supabase'
import { notificationTriggers } from '@/lib/notification-triggers'
import { ListingPreviewModal } from '@/components/listing-preview-modal'
import {
  Upload,
  MapPin,
  DollarSign,
  Calendar,
  Image,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Camera,
  Home,
  Car,
  Wrench,
  Laptop,
  Shirt,
  Music,
  Camera as CameraIcon,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import GoogleMapsAutocomplete from '@/components/google-maps-autocomplete'
import { PhoneInput, parsePhoneNumber } from '@/components/ui/phone-input'

interface ListingForm {
  id?: string
  title: string
  description: string
  category: string
  subcategory: string
  price: string
  priceType: 'per_hour' | 'per_day' | 'per_week' | 'per_month'
  location: string
  availability: {
    startDate: string
    endDate: string
    timeSlots: string[]
  }
  features: string[]
  images: File[]
  imageUrls: string[]
  rules: string[]
  contactInfo: {
    phone: string
    email: string
    preferredContact: 'phone' | 'email' | 'both'
  }
  ownerDetails: {
    name: string
    phone: string
    email: string
    responseTime: string
    verified: boolean
  }
  returnPolicy: 'flexible' | 'moderate' | 'strict'
  status?: 'draft' | 'published' | 'archived'
}

const categories = [
  { value: 'vehicles', label: 'Vehicles', icon: Car, subcategories: ['Cars', 'Motorcycles', 'Trucks', 'Bicycles', 'Scooters'] },
  { value: 'equipment', label: 'Equipment', icon: Wrench, subcategories: ['Construction', 'Gardening', 'Cleaning', 'Kitchen', 'Office'] },
  { value: 'homes', label: 'Homes & Apartments', icon: Home, subcategories: ['Apartments', 'Houses', 'Rooms', 'Studios', 'Villas'] },
  { value: 'electronics', label: 'Electronics', icon: Laptop, subcategories: ['Computers', 'Phones', 'Cameras', 'Audio', 'Gaming'] },
  { value: 'fashion', label: 'Fashion', icon: Shirt, subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags'] },
  { value: 'entertainment', label: 'Entertainment', icon: Music, subcategories: ['Instruments', 'Gaming', 'Events', 'Sports', 'Books'] },
  { value: 'photography', label: 'Photography', icon: CameraIcon, subcategories: ['Cameras', 'Lighting', 'Accessories', 'Studios', 'Props'] }
]

const priceTypes = [
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_week', label: 'Per Week' },
  { value: 'per_month', label: 'Per Month' }
]

const returnPolicies = [
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Full refund if canceled 24 hours before rental. 50% refund if canceled within 24 hours.',
    icon: '😊'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Full refund if canceled 48 hours before rental. No refund if canceled within 48 hours.',
    icon: '⚖️'
  },
  {
    value: 'strict',
    label: 'Strict',
    description: 'Full refund if canceled 7 days before rental. 50% refund if canceled within 7 days. No refund within 24 hours.',
    icon: '🔒'
  }
]

export default function CreateListingPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<ListingData | null>(null)

  const { uploadFiles, isUploading: isUploadingImages } = useCloudinaryUpload({
    folder: 'property-listings',
    tags: ['property', 'listing']
  })

  const [formData, setFormData] = useState<ListingForm>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    priceType: 'per_day',
    location: '',
    availability: {
      startDate: '',
      endDate: '',
      timeSlots: []
    },
    features: [],
    images: [],
    imageUrls: [],
    rules: [],
    contactInfo: {
      phone: '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      preferredContact: 'both'
    },
    ownerDetails: {
      name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      responseTime: '< 1 hour',
      verified: (user?.unsafeMetadata?.verificationStatus as string) === 'approved' || false
    },
    returnPolicy: 'flexible',
    status: 'draft'
  })

  const [newFeature, setNewFeature] = useState('')
  const [newRule, setNewRule] = useState('')
  const [newTimeSlot, setNewTimeSlot] = useState('')

  // Load draft if editing
  useEffect(() => {
    if (draftId && user) {
      loadDraft(draftId)
    }
  }, [draftId, user])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!user || !formData.title) return

    const autoSaveInterval = setInterval(() => {
      handleSaveDraft(true)
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [user, formData])

  const loadDraft = async (id: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const draft = await listingsServiceSupabase.getListingPreview(id, user.id)
      if (draft) {
        setFormData({
          id: draft.id,
          title: draft.title,
          description: draft.description || '',
          category: draft.category || '',
          subcategory: draft.subcategory || '',
          price: draft.price?.toString() || '',
          priceType: (draft.priceType as any) || 'per_day',
          location: draft.location || '',
          availability: draft.availability || { startDate: '', endDate: '', timeSlots: [] },
          features: draft.features || [],
          images: [],
          imageUrls: draft.images || [],
          rules: draft.rules || [],
          contactInfo: draft.contactInfo || {
            phone: '',
            email: user?.primaryEmailAddress?.emailAddress || '',
            preferredContact: 'both'
          },
          ownerDetails: {
            name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
            email: user?.primaryEmailAddress?.emailAddress || '',
            responseTime: 'Within hours',
            verified: (user?.unsafeMetadata?.verificationStatus as string) === 'approved' || false
          },
          returnPolicy: 'flexible',
          status: draft.status
        })
        toast({
          title: "Draft loaded",
          description: "Continue editing your listing"
        })
      }
    } catch (error) {
      console.error('Error loading draft:', error)
      toast({
        title: "Error",
        description: "Failed to load draft",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ListingForm] as any),
        [field]: value
      }
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }))
      setNewRule('')
    }
  }

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  const addTimeSlot = () => {
    if (newTimeSlot.trim()) {
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          timeSlots: [...prev.availability.timeSlots, newTimeSlot.trim()]
        }
      }))
      setNewTimeSlot('')
    }
  }

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.filter((_, i) => i !== index)
      }
    }))
  }

  const uploadImages = async (images: File[]) => {
    if (images.length === 0) return []

    try {
      const results = await uploadFiles(images, {
        folder: `property-listings/${user?.id}/${Date.now()}`,
        tags: ['property-listing', 'owner-upload']
      })
      return results.map(result => result.secure_url)
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!user) return

    setIsSavingDraft(true)
    try {
      // Ensure we have at least a title for the draft
      if (!formData.title || formData.title.trim() === '') {
        throw new Error('Please enter a title before saving the draft')
      }

      // Upload new images if any
      let newImageUrls: string[] = []
      if (formData.images.length > 0) {
        try {
          newImageUrls = await uploadImages(formData.images)
        } catch (uploadError: any) {
          console.error('Error uploading images:', uploadError)
          // Continue without images if upload fails - don't block draft saving
          if (!isAutoSave) {
            toast({
              title: "⚠️ Image Upload Failed",
              description: "Draft will be saved without new images. " + (uploadError?.message || "Please try uploading images again."),
              variant: "default",
              duration: 4000
            })
          }
        }
      }

      const allImageUrls = [...formData.imageUrls, ...newImageUrls]

      const listingData: Partial<ListingData> = {
        id: formData.id,
        user_id: user.id,
        title: formData.title,
        description: formData.description || '',
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        price: formData.price ? parseFloat(formData.price) : null,
        priceType: formData.priceType || 'per_day',
        location: formData.location || null,
        availability: formData.availability || null,
        features: Array.isArray(formData.features) ? formData.features : [],
        images: Array.isArray(allImageUrls) ? allImageUrls : [],
        rules: Array.isArray(formData.rules) ? formData.rules : [],
        contactInfo: formData.contactInfo || null,
      }

      const { id } = await listingsServiceSupabase.saveDraft(user.id, listingData)

      setFormData(prev => ({ ...prev, id, images: [], imageUrls: allImageUrls }))
      setLastSaved(new Date())

      if (!isAutoSave) {
        toast({
          title: "✅ Draft saved",
          description: "Your listing has been saved as a draft"
        })
      }
    } catch (error: any) {
      console.error('Error saving draft:', error)
      if (!isAutoSave) {
        const errorMessage = error?.message || "Failed to save draft"
        const isDatabaseError = errorMessage.includes('Database not configured') ||
          errorMessage.includes('Supabase') ||
          errorMessage.includes('table') ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('migration')

        toast({
          title: isDatabaseError ? "⚠️ Database Not Configured" : "❌ Error Saving Draft",
          description: isDatabaseError
            ? "Supabase is not set up or database tables are missing. Please configure your database credentials and run migration scripts to save drafts."
            : errorMessage,
          variant: "destructive",
          duration: 6000
        })
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handlePreview = async () => {
    if (!user || !formData.id) {
      // Save as draft first if not saved
      await handleSaveDraft()
      return
    }

    try {
      const listing = await listingsServiceSupabase.getListingPreview(formData.id, user.id)
      setPreviewData(listing)
      setShowPreview(true)
    } catch (error) {
      console.error('Error loading preview:', error)
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive"
      })
    }
  }

  const handlePublish = async () => {
    if (!user || !formData.id) return

    // Check subscription status
    const subscriptionStatus = (user.unsafeMetadata?.subscriptionStatus as string) ||
      (user.publicMetadata?.subscriptionStatus as string)
    const subscriptionPlan = (user.unsafeMetadata?.subscriptionPlan as string) ||
      (user.publicMetadata?.subscriptionPlan as string)
    const subscriptionEndsAt = (user.unsafeMetadata?.subscriptionEndsAt as string) ||
      (user.publicMetadata?.subscriptionEndsAt as string)

    const isTrial = subscriptionPlan === 'trial'
    const isPaidPlan = ['basic', 'professional', 'premium'].includes(subscriptionStatus || '')

    let hasActiveSubscription = isPaidPlan

    if (isTrial && subscriptionEndsAt) {
      const now = new Date()
      const endDate = new Date(subscriptionEndsAt)
      if (now < endDate) {
        hasActiveSubscription = true
      }
    }

    if (!hasActiveSubscription) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription or free trial to publish listings. Please upgrade your plan.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/profile/billing')}>
            Upgrade
          </Button>
        )
      })
      return
    }

    setIsPublishing(true)
    try {
      await listingsServiceSupabase.publishListing(formData.id, user.id, formData.title)

      // Old notification trigger (now replaced by automatic notification in publishListing)
      // await notificationTriggers.triggerListingStatusNotification(
      //   user.id,
      //   formData.title,
      //   'published'
      // )

      toast({
        title: "Success!",
        description: "Your listing is now live and visible to renters"
      })

      setShowPreview(false)
      router.push('/dashboard/owner')
    } catch (error) {
      console.error('Error publishing listing:', error)
      toast({
        title: "Error",
        description: "Failed to publish listing",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category)

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Database Configuration Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Database Not Configured</h3>
                <p className="text-sm text-yellow-700">
                  Supabase is not set up. You can still create your listing, but draft saving and publishing features won't work.
                  Please configure your database credentials in <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable all features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header - Mobile responsive */}
        <div className="mb-6 md:mb-8">
          {/* Top row: Back button and Action buttons */}
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-shrink-0 h-9 md:h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Action buttons - wrap on mobile */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => handleSaveDraft(false)}
                disabled={isSavingDraft || !formData.title}
                className="h-9 md:h-10 px-2 md:px-4 text-xs md:text-sm"
              >
                {isSavingDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gray-600 mr-1 md:mr-2"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Save Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!formData.title || !formData.description}
                className="bg-blue-600 hover:bg-blue-700 h-9 md:h-10 px-2 md:px-4 text-xs md:text-sm"
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Preview & Publish</span>
                <span className="sm:hidden">Publish</span>
              </Button>
            </div>
          </div>

          {/* Title and status row */}
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex-1 min-w-0">
                {formData.id ? 'Edit Listing' : 'Create New Listing'}
              </h1>
              {formData.status === 'draft' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex-shrink-0 text-xs md:text-sm">
                  <FileText className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-1">List your item for rent and start earning</p>
            {lastSaved && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          {/* Mobile: Horizontal scrollable tabs, Desktop: Grid */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid w-full md:grid-cols-3 lg:grid-cols-6 h-auto min-w-max md:min-w-0 gap-1 md:gap-2 p-1 md:p-1">
              <TabsTrigger
                value="basic"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="owner"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Owner Info
              </TabsTrigger>
              <TabsTrigger
                value="policy"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Return Policy
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Availability
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5"
              >
                Review
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., 2023 Toyota Camry - Perfect for Road Trips"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your item in detail..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const IconComponent = category.icon
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)} disabled={!formData.category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub.toLowerCase().replace(' ', '_')}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type *</Label>
                    <Select value={formData.priceType} onValueChange={(value: any) => handleInputChange('priceType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <GoogleMapsAutocomplete
                    label="Property Location *"
                    placeholder="Enter property address (e.g., Nairobi, Kenya)"
                    defaultValue={formData.location}
                    onPlaceSelect={(place) => {
                      handleInputChange('location', place.formatted_address)
                      // Optionally store coordinates for future map display
                      console.log('Coordinates:', place.geometry.location.lat, place.geometry.location.lng)
                    }}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Add features, rules, and images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">{feature}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Rules */}
                <div className="space-y-4">
                  <Label>Rules & Requirements</Label>
                  <div className="space-y-2">
                    {formData.rules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline">{rule}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeRule(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Add a rule..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                    />
                    <Button onClick={addRule}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <Label>Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={`url-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removeImageUrl(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {formData.images.map((image, index) => (
                      <div key={`file-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="text-center">
                          {isUploadingImages ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Uploading...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">Add Images</p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <Label>Contact Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <PhoneInput
                        value={parsePhoneNumber(formData.contactInfo.phone).phoneNumber}
                        onChange={(value) => {
                          // Store the phone number without country code
                          handleNestedInputChange('contactInfo', 'phone', value)
                        }}
                        defaultCountry="KE"
                        placeholder="700 000 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                    <Select
                      value={formData.contactInfo.preferredContact}
                      onValueChange={(value: any) => handleNestedInputChange('contactInfo', 'preferredContact', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Owner Details Tab */}
          <TabsContent value="owner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Owner Information
                </CardTitle>
                <CardDescription>Your contact details will be shared with renters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Full Name *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerDetails.name}
                      onChange={(e) => handleNestedInputChange('ownerDetails', 'name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <PhoneInput
                      value={parsePhoneNumber(formData.ownerDetails.phone).phoneNumber}
                      onChange={(value) => {
                        // Store the phone number without country code
                        handleNestedInputChange('ownerDetails', 'phone', value)
                      }}
                      defaultCountry="KE"
                      placeholder="700 000 000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email Address *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerDetails.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">Email is automatically set from your account</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseTime">Typical Response Time</Label>
                  <Select
                    value={formData.ownerDetails.responseTime}
                    onValueChange={(value) => handleNestedInputChange('ownerDetails', 'responseTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 1 hour">Within 1 hour</SelectItem>
                      <SelectItem value="< 3 hours">Within 3 hours</SelectItem>
                      <SelectItem value="< 24 hours">Within 24 hours</SelectItem>
                      <SelectItem value="1-2 days">1-2 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.ownerDetails.verified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">Verified Owner</p>
                      <p className="text-xs text-green-700 dark:text-green-300">Your identity has been verified</p>
                    </div>
                  </div>
                )}

                {!formData.ownerDetails.verified && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Complete Verification</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Verified owners get 3x more bookings.
                        <Link href="/verification" className="underline ml-1">Verify now</Link>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Return Policy Tab */}
          <TabsContent value="policy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Return & Cancellation Policy
                </CardTitle>
                <CardDescription>Choose a policy that works for you and your renters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {returnPolicies.map((policy) => (
                    <Card
                      key={policy.value}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${formData.returnPolicy === policy.value
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      onClick={() => setFormData({ ...formData, returnPolicy: policy.value as any })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{policy.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">{policy.label}</h4>
                              {formData.returnPolicy === policy.value && (
                                <Badge variant="default" className="bg-blue-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {policy.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Current Selection: {returnPolicies.find(p => p.value === formData.returnPolicy)?.label}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {returnPolicies.find(p => p.value === formData.returnPolicy)?.description}
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Policy Tips:</p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li><strong>Flexible</strong> policies attract 40% more renters</li>
                      <li><strong>Moderate</strong> policies balance protection and bookings</li>
                      <li><strong>Strict</strong> policies protect against last-minute cancellations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Set when your item is available for rent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Available From</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.availability.startDate}
                      onChange={(e) => handleNestedInputChange('availability', 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Available Until</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.availability.endDate}
                      onChange={(e) => handleNestedInputChange('availability', 'endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Time Slots (Optional)</Label>
                  <div className="space-y-2">
                    {formData.availability.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">{slot}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTimeSlot())}
                    />
                    <Button onClick={addTimeSlot}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Listing</CardTitle>
                <CardDescription>Make sure everything looks good before saving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{formData.title || 'No title'}</h3>
                    <p className="text-gray-600">{formData.description || 'No description'}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {selectedCategory && <Badge variant="outline">{selectedCategory.label}</Badge>}
                    {formData.subcategory && <Badge variant="outline">{formData.subcategory}</Badge>}
                    <span className="text-lg font-semibold">
                      ${formData.price || '0.00'} {formData.priceType.replace('_', ' ')}
                    </span>
                  </div>

                  {formData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{formData.location}</span>
                    </div>
                  )}

                  {formData.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.rules.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Rules:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.rules.map((rule, index) => (
                          <li key={index} className="text-sm text-gray-600">{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">
                      Images ({formData.images.length + formData.imageUrls.length}):
                    </h4>
                    {(formData.images.length + formData.imageUrls.length) > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.imageUrls.map((url, index) => (
                          <img
                            key={`url-${index}`}
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                        {formData.images.map((image, index) => (
                          <img
                            key={`file-${index}`}
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No images added</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      <ListingPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        listing={previewData}
        onPublish={handlePublish}
        onContinueEditing={() => setShowPreview(false)}
        isPublishing={isPublishing}
      />
    </div>
  )
}
