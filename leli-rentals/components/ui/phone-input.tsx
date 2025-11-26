'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CountryCode {
  code: string
  name: string
  dialCode: string
  flag: string
}

const countryCodes: CountryCode[] = [
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onCountryChange?: (countryCode: string) => void
  defaultCountry?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  defaultCountry = 'KE',
  placeholder = 'Enter phone number',
  className,
  disabled = false,
  required = false
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === defaultCountry) || countryCodes[0]
  )

  const handleCountryChange = (countryCode: string) => {
    const country = countryCodes.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      onCountryChange?.(countryCode)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const numericValue = e.target.value.replace(/[^\d]/g, '')
    onChange(numericValue)
  }

  // Get the full phone number with country code
  const fullPhoneNumber = value ? `${selectedCountry.dialCode}${value}` : ''

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{country.dialCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="flex-1"
        maxLength={15}
      />
      
      {/* Hidden input for form submission with full phone number */}
      <input
        type="hidden"
        name="fullPhoneNumber"
        value={fullPhoneNumber}
      />
    </div>
  )
}

// Helper function to format phone number for display
export function formatPhoneNumber(phoneNumber: string, countryCode?: string): string {
  if (!phoneNumber) return ''
  
  const country = countryCodes.find(c => c.code === countryCode) || countryCodes[0]
  
  // If phone number already has country code, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber
  }
  
  // Otherwise, add country code
  return `${country.dialCode}${phoneNumber}`
}

// Helper function to parse phone number
export function parsePhoneNumber(fullPhoneNumber: string): { countryCode: string; phoneNumber: string } {
  if (!fullPhoneNumber) return { countryCode: 'KE', phoneNumber: '' }
  
  // Find matching country code
  for (const country of countryCodes) {
    if (fullPhoneNumber.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        phoneNumber: fullPhoneNumber.slice(country.dialCode.length)
      }
    }
  }
  
  // Default to Kenya if no match
  return { countryCode: 'KE', phoneNumber: fullPhoneNumber }
}

