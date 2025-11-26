"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Users, 
  Building2,
  Mountain,
  Waves,
  TreePine,
  Sun
} from 'lucide-react'
import { kenyaCounties, getRegions, getCounties, searchLocations, Location } from '@/lib/kenya-locations'

interface LocationSelectorProps {
  selectedLocation?: string
  onLocationSelect: (location: Location) => void
  placeholder?: string
  className?: string
}

export function LocationSelector({
  selectedLocation,
  onLocationSelect,
  placeholder = "Select location",
  className = ""
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedCounty, setSelectedCounty] = useState<string>("all")
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [popularLocations, setPopularLocations] = useState<Location[]>([])

  const regions = getRegions()
  const counties = getCounties()

  useEffect(() => {
    // Load popular locations
    setPopularLocations(kenyaCounties.filter(loc => loc.popular).slice(0, 12))
    
    // Initial filtered locations
    let filtered = kenyaCounties

    // Apply region filter
    if (selectedRegion !== "all") {
      filtered = filtered.filter(loc => loc.region === selectedRegion)
    }

    // Apply county filter
    if (selectedCounty !== "all") {
      filtered = filtered.filter(loc => loc.county === selectedCounty)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchLocations(searchQuery).filter(loc => {
        const matchesRegion = selectedRegion === "all" || loc.region === selectedRegion
        const matchesCounty = selectedCounty === "all" || loc.county === selectedCounty
        return matchesRegion && matchesCounty
      })
    }

    setFilteredLocations(filtered.slice(0, 50)) // Limit to 50 results
  }, [searchQuery, selectedRegion, selectedCounty])

  const getRegionIcon = (region: string) => {
    switch (region) {
      case 'Central': return <Building2 className="h-4 w-4" />
      case 'Coast': return <Waves className="h-4 w-4" />
      case 'Eastern': return <Sun className="h-4 w-4" />
      case 'Nyanza': return <Waves className="h-4 w-4" />
      case 'Rift Valley': return <Mountain className="h-4 w-4" />
      case 'Western': return <TreePine className="h-4 w-4" />
      case 'North Eastern': return <Sun className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'Central': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Coast': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'Eastern': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Nyanza': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rift Valley': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Western': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'North Eastern': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location)
    setIsOpen(false)
  }

  const selectedLocationData = kenyaCounties.find(loc => loc.name === selectedLocation)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full justify-start text-left ${className}`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {selectedLocationData ? (
            <div className="flex items-center gap-2">
              <span>{selectedLocationData.name}</span>
              <Badge variant="outline" className={getRegionColor(selectedLocationData.region)}>
                {selectedLocationData.region}
              </Badge>
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Location in Kenya
          </DialogTitle>
          <DialogDescription>
            Choose from {kenyaCounties.length}+ locations across Kenya
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                aria-label="Filter by region"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                aria-label="Filter by county"
              >
                <option value="all">All Counties</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Locations */}
          {!searchQuery && selectedRegion === "all" && selectedCounty === "all" && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Popular Locations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {popularLocations.map(location => (
                  <Button
                    key={location.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLocationClick(location)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.county}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* All Locations */}
          <div className="max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {searchQuery ? 'Search Results' : 'All Locations'}
              <Badge variant="outline">{filteredLocations.length}</Badge>
            </h3>
            
            <div className="space-y-2">
              {filteredLocations.map(location => (
                <Card 
                  key={location.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleLocationClick(location)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {getRegionIcon(location.region)}
                        </div>
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {location.county} • {location.region}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getRegionColor(location.region)}>
                          {location.region}
                        </Badge>
                        {location.popular && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No locations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LocationSelector
