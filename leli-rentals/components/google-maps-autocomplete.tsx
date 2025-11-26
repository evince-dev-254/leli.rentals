'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PlaceResult {
  formatted_address: string
  place_id: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

interface GoogleMapsAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void
  defaultValue?: string
  placeholder?: string
  label?: string
  required?: boolean
}

export default function GoogleMapsAutocomplete({
  onPlaceSelect,
  defaultValue = '',
  placeholder = 'Enter location',
  label,
  required = false,
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string>('')
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    // Check if Google Maps API is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.')
      return
    }

    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    )

    if (existingScript) {
      // Script is loading, wait for it
      existingScript.addEventListener('load', () => setIsLoaded(true))
      return
    }

    // Load Google Maps script if not already loaded
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => setError('Failed to load Google Maps API')
      document.head.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    try {
      // Initialize autocomplete
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
      })

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (!place.geometry || !place.geometry.location) {
          setError('No details available for this location')
          return
        }

        const result: PlaceResult = {
          formatted_address: place.formatted_address || '',
          place_id: place.place_id || '',
          geometry: {
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          },
          address_components: place.address_components || [],
        }

        onPlaceSelect(result)
        setError('')
      })

      autocompleteRef.current = autocomplete
    } catch (err) {
      console.error('Error initializing autocomplete:', err)
      setError('Failed to initialize location search')
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onPlaceSelect])

  if (error) {
    return (
      <div>
        {label && <Label>{label}</Label>}
        <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-800 dark:text-red-200">
          {error}
          {error.includes('API key') && (
            <p className="mt-2 text-xs">
              See <code className="bg-red-100 dark:bg-red-800 px-1 rounded">GOOGLE_MAPS_SETUP_GUIDE.md</code> for setup instructions
            </p>
          )}
        </div>
        {/* Fallback to regular input */}
        <Input
          ref={inputRef}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="mt-2"
        />
      </div>
    )
  }

  return (
    <div>
      {label && <Label htmlFor="location-autocomplete">{label}</Label>}
      <Input
        id="location-autocomplete"
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={isLoaded ? placeholder : 'Loading location search...'}
        disabled={!isLoaded}
        required={required}
      />
      {!isLoaded && (
        <p className="text-xs text-gray-500 mt-1">Loading Google Maps...</p>
      )}
    </div>
  )
}

