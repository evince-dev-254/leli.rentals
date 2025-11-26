'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Star, 
  Shield,
  CheckCircle2,
  Edit,
  X
} from 'lucide-react'
import { ListingData } from '@/lib/listings-service-supabase'

interface ListingPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  listing: ListingData | null
  onPublish: () => void
  onContinueEditing: () => void
  isPublishing?: boolean
}

export function ListingPreviewModal({
  isOpen,
  onClose,
  listing,
  onPublish,
  onContinueEditing,
  isPublishing = false
}: ListingPreviewModalProps) {
  if (!listing) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Preview Your Listing</DialogTitle>
              <DialogDescription>
                This is how your listing will appear to renters
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Images Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="relative rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {listing.images.slice(0, 6).map((image, index) => (
                  <div
                    key={index}
                    className={`relative ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      style={{ minHeight: index === 0 ? '300px' : '150px' }}
                    />
                  </div>
                ))}
              </div>
              {listing.images.length > 6 && (
                <Badge className="absolute bottom-4 right-4 bg-black/70 text-white">
                  +{listing.images.length - 6} more photos
                </Badge>
              )}
            </div>
          )}

          {/* Title and Price */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900">{listing.title}</h2>
                {listing.location && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="text-3xl font-bold text-blue-600">
                    {listing.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {listing.priceType?.replace('_', ' ') || 'per day'}
                </span>
              </div>
            </div>
          </div>

          {/* Category and Status Badges */}
          <div className="flex flex-wrap gap-2">
            {listing.category && (
              <Badge variant="secondary" className="capitalize">
                {listing.category}
              </Badge>
            )}
            {listing.subcategory && (
              <Badge variant="outline" className="capitalize">
                {listing.subcategory}
              </Badge>
            )}
            <Badge 
              className={
                listing.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {listing.status === 'published' ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                'Draft'
              )}
            </Badge>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Features & Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {listing.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {listing.availability && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {listing.availability.startDate && (
                  <p className="text-sm">
                    <span className="font-medium">From:</span>{' '}
                    {new Date(listing.availability.startDate).toLocaleDateString()}
                  </p>
                )}
                {listing.availability.endDate && (
                  <p className="text-sm">
                    <span className="font-medium">Until:</span>{' '}
                    {new Date(listing.availability.endDate).toLocaleDateString()}
                  </p>
                )}
                {listing.availability.timeSlots && listing.availability.timeSlots.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Time Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {listing.availability.timeSlots.map((slot: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rules */}
          {listing.rules && listing.rules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rules & Requirements
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {listing.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Information */}
          {listing.contactInfo && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="space-y-1 text-sm">
                {listing.contactInfo.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {listing.contactInfo.phone}
                  </p>
                )}
                {listing.contactInfo.email && (
                  <p>
                    <span className="font-medium">Email:</span> {listing.contactInfo.email}
                  </p>
                )}
                {listing.contactInfo.preferredContact && (
                  <p className="text-gray-600">
                    Preferred: {listing.contactInfo.preferredContact}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onContinueEditing}
            disabled={isPublishing}
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Continue Editing
          </Button>
          <Button
            onClick={onPublish}
            disabled={isPublishing || listing.status === 'published'}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : listing.status === 'published' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Already Published
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Publish Listing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

