import { Header } from "@/components/header"
import { getListingsByCategory } from "@/lib/mock-data"
import { ListingsClient } from "./listings-client"

// Generate static params for all categories
export async function generateStaticParams() {
  // Comprehensive list of all possible categories
  const categories = [
    'all',
    'homes',
    'vehicles', 
    'equipment',
    'events',
    'fashion',
    'tech',
    'sports',
    'tools',
    'home',
    'vehicle',
    'electronics',
    'appliances',
    'furniture',
    'clothing',
    'accessories',
    'recreation',
    'outdoor',
    'indoor',
    'professional',
    'business',
    'automotive',
    'construction',
    'photography',
    'audio',
    'video',
    'computing',
    'gaming',
    'fitness',
    'wellness',
    'beauty',
    'healthcare',
    'education',
    'office',
    'industrial',
    'agricultural',
    'marine',
    'aviation',
    'entertainment',
    'party',
    'wedding',
    'corporate',
    'conference',
    'meeting',
    'workshop',
    'training',
    'exhibition',
    'trade-show',
    'concert',
    'festival'
  ]
  
  return categories.map((category) => ({
    category: category,
  }))
}

const categoryTitles = {
  all: "All Listings",
  homes: "Homes & Apartments",
  vehicles: "Vehicles",
  equipment: "Equipment & Tools",
  events: "Event Spaces & Venues",
  fashion: "Fashion & Lifestyle",
  tech: "Tech & Gadgets",
  sports: "Sports & Recreation",
  tools: "Tools",
  home: "Home & Living",
  vehicle: "Vehicles",
  electronics: "Electronics",
  appliances: "Appliances",
  furniture: "Furniture",
  clothing: "Clothing",
  accessories: "Accessories",
  recreation: "Recreation",
  outdoor: "Outdoor Equipment",
  indoor: "Indoor Equipment",
  professional: "Professional Services",
  business: "Business Equipment",
}

const categoryDescriptions = {
  all: "Browse all available listings across all categories",
  homes: "Find the perfect place to stay, from cozy apartments to luxury penthouses",
  vehicles: "Rent cars, SUVs, and specialty vehicles for any occasion",
  equipment: "Professional tools and equipment for your projects",
  events: "Beautiful venues and spaces for your special events",
  fashion: "Designer clothing and accessories for special occasions",
  tech: "Latest technology and gadgets for work and entertainment",
  sports: "Sports equipment and gear for your active lifestyle",
  tools: "Professional tools and equipment for construction, repair, and DIY projects",
  home: "Home and living essentials for your space",
  vehicle: "Cars, trucks, and specialty vehicles for rent",
  electronics: "Electronic devices and gadgets for rent",
  appliances: "Home appliances and equipment",
  furniture: "Furniture and home decor items",
  clothing: "Fashion and clothing for special occasions",
  accessories: "Fashion accessories and lifestyle items",
  recreation: "Recreational equipment and activities",
  outdoor: "Outdoor gear and equipment",
  indoor: "Indoor equipment and tools",
  professional: "Professional services and equipment",
  business: "Business equipment and services",
}

interface ListingPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function ListingPage(props: ListingPageProps) {
  const params = await props.params;
  const category = params.category
  
  const categoryTitle = categoryTitles[category as keyof typeof categoryTitles] || `Listings - ${category.charAt(0).toUpperCase() + category.slice(1)}`
  const categoryDescription = categoryDescriptions[category as keyof typeof categoryDescriptions] || `Browse ${category} listings and find what you're looking for`
  const listings = getListingsByCategory(category)

  // Get unique locations for filter dropdown
  const locations = [...new Set(listings.map((listing) => listing.location))]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ListingsClient 
        category={category}
        categoryTitle={categoryTitle}
        categoryDescription={categoryDescription}
        listings={listings}
        locations={locations}
      />
    </div>
  )
}
