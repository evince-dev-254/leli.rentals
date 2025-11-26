"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import InternationalPhoneInput from "@/components/international-phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  Star,
  MapPin,
  Shield,
  Heart,
  Share2,
  CreditCard,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import Link from "next/link"
import type { Listing } from "@/lib/mock-data"

interface ItemDetailClientProps {
  listing: Listing
}

export function ItemDetailClient({ listing }: ItemDetailClientProps) {
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({})
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  })

  // Calculate total price based on selected dates
  const totalDays = useMemo(() => {
    if (selectedDates.from && selectedDates.to) {
      return differenceInDays(selectedDates.to, selectedDates.from) + 1
    }
    return 1
  }, [selectedDates])

  const totalPrice = useMemo(() => {
    return listing.price * totalDays
  }, [listing.price, totalDays])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate booking API call
    setTimeout(() => {
      console.log("Booking submitted:", {
        listingId: listing.id,
        dates: selectedDates,
        totalPrice,
        userData: bookingData,
      })
      setIsLoading(false)
      setIsBookingOpen(false)
      
      // Show success toast
      toast({
        title: "🎉 Booking Request Submitted!",
        description: `Your booking request for "${listing.title}" has been sent successfully.`,
        duration: 3000,
      })
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/listings/${listing.category}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {listing.category}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[4/3] overflow-hidden rounded-lg">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.onerror = null
                            const fallback = `/images/${listing.category || 'placeholder'}/${listing.category || 'placeholder'}-1.svg`
                            t.src = fallback
                            t.alt = `${listing.title} - image not available`
                          }}
                        />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="bg-background/80 backdrop-blur">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-background/80 backdrop-blur">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title and Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{listing.rating}</span>
                    <span>({listing.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">
                  ${listing.price}
                  <span className="text-lg font-normal text-muted-foreground">/day</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">About this rental</h2>
            <p className="text-muted-foreground leading-relaxed">{listing.fullDescription}</p>
          </div>

          <Separator />

          {/* Owner Info */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Meet your host</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.owner.avatar || "/placeholder.svg"} alt={listing.owner.name} />
                    <AvatarFallback>{listing.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{listing.owner.name}</h3>
                      {listing.owner.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{listing.owner.rating}</span>
                      <span className="text-muted-foreground">host rating</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Host
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Book this rental</CardTitle>
                <CardDescription>${listing.price}/day • Available now</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select dates</Label>
                  <Calendar
                    mode="range"
                    selected={{ from: selectedDates.from ?? undefined, to: selectedDates.to ?? undefined }}
                    onSelect={(range) => setSelectedDates(range || {})}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                {/* Price Breakdown */}
                {selectedDates.from && selectedDates.to && (
                  <div className="space-y-2 p-4 bg-card rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${listing.price} × {totalDays} days
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>${Math.round(totalPrice * 0.1)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totalPrice + Math.round(totalPrice * 0.1)}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={!selectedDates.from || !selectedDates.to}>
                      {selectedDates.from && selectedDates.to ? "Book Now" : "Select dates first"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Complete your booking</DialogTitle>
                      <DialogDescription>
                        {selectedDates.from && selectedDates.to && (
                          <>
                            {format(selectedDates.from, "MMM dd")} - {format(selectedDates.to, "MMM dd")} •{" "}
                            {totalDays} days
                          </>
                        )}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBooking} className="space-y-4">
                      {/* Personal Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold">Personal Information</h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="name"
                                placeholder="Enter your full name"
                                className="pl-10"
                                value={bookingData.name}
                                onChange={(e) => setBookingData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                value={bookingData.email}
                                onChange={(e) => setBookingData((prev) => ({ ...prev, email: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <InternationalPhoneInput
                              value={bookingData.phone}
                              onChange={(phone) => setBookingData((prev) => ({ ...prev, phone }))}
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold">Payment Information</h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                className="pl-10"
                                value={bookingData.cardNumber}
                                onChange={(e) => setBookingData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={bookingData.expiryDate}
                                onChange={(e) => setBookingData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={bookingData.cvv}
                                onChange={(e) => setBookingData((prev) => ({ ...prev, cvv: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Message */}
                      <div>
                        <Label htmlFor="message">Message to host (optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the host about your rental needs..."
                          value={bookingData.message}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, message: e.target.value }))}
                        />
                      </div>

                      {/* Total */}
                      <div className="p-4 bg-card rounded-lg">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${totalPrice + Math.round(totalPrice * 0.1)}</span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Confirm Booking"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Additional Info */}
                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free cancellation for 48 hours</span>
                  </div>
                  <p>You won't be charged yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

