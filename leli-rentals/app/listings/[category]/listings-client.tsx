"use client"

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPin, Star, Filter, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Listing } from "@/lib/mock-data"

interface ListingsClientProps {
  category: string
  categoryTitle: string
  categoryDescription: string
  listings: Listing[]
  locations: string[]
}

export function ListingsClient({ 
  category, 
  categoryTitle, 
  categoryDescription, 
  listings, 
  locations 
}: ListingsClientProps) {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedLocation, setSelectedLocation] = useState<string>("any")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("featured")

  // Check if category is a numeric ID and redirect to details page
  useEffect(() => {
    if (/^\d+$/.test(category)) {
      router.replace(`/listings/details/${category}`)
    }
  }, [category, router])

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    const filtered = listings.filter((listing) => {
      const priceInRange = listing.price >= priceRange[0] && listing.price <= priceRange[1]
      const locationMatch = selectedLocation === "any" || listing.location === selectedLocation
      return priceInRange && locationMatch
    })

    // Sort listings
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Keep original order for "featured"
        break
    }

    return filtered
  }, [listings, priceRange, selectedLocation, sortBy])

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setSelectedLocation("any")
    setDateFrom(undefined)
    setDateTo(undefined)
    setSortBy("featured")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{categoryTitle}</h1>
        <p className="text-xl text-muted-foreground mb-4">{categoryDescription}</p>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? "item" : "items"} available
          </p>
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-80">
          <div className="lg:sticky lg:top-24">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            <Card className={cn("border-2", showFilters || "hidden lg:block")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Price Range (per day)</Label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any location</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Date Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Availability</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "MMM dd") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Listings Grid/List */}
        <div className="flex-1">
          {filteredAndSortedListings.length === 0 ? (
            <Card className="p-12 text-center">
              <CardContent>
                <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
                <Button onClick={clearFilters}>Clear filters</Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6",
              )}
            >
              {filteredAndSortedListings.map((listing) => (
                <Link key={listing.id} href={`/listings/details/${listing.id}`}>
                  <Card
                    className={cn(
                      "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50",
                      viewMode === "list" && "flex flex-row overflow-hidden",
                    )}
                  >
                    <div
                      className={cn(
                        "overflow-hidden",
                        viewMode === "grid" ? "aspect-[4/3] rounded-t-lg" : "w-64 h-48",
                      )}
                    >
                      <img
                        src={listing.image || listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title || 'Listing image'}
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.onerror = null
                          t.src = "/placeholder.svg"
                          t.alt = listing.title ? `${listing.title} - image not available` : 'Image not available'
                        }}
                      />
                    </div>

                    <div className={cn("flex-1", viewMode === "list" && "p-6")}>
                      <CardHeader className={cn(viewMode === "grid" ? "pb-2" : "pb-2 px-0 pt-0")}>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {listing.title}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{listing.rating}</span>
                            <span className="text-muted-foreground">({listing.reviews})</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className={cn("pt-0", viewMode === "list" && "px-0")}>
                        <CardDescription className="text-muted-foreground mb-3 line-clamp-2">
                          {listing.description}
                        </CardDescription>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {listing.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-foreground">
                            ${listing.price}
                            <span className="text-sm font-normal text-muted-foreground">/day</span>
                          </div>
                          <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

