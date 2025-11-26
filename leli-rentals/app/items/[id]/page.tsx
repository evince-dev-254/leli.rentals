import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getListingById } from "@/lib/mock-data"
import { ItemDetailClient } from "./item-detail-client"

// Generate static params for popular listings
export async function generateStaticParams() {
  // Generate params for the first 50 listings of each category
  const categories = ['homes', 'vehicles', 'equipment', 'events', 'fashion', 'tech', 'sports', 'tools']
  const params = []
  
  for (const category of categories) {
    for (let i = 1; i <= 50; i++) {
      params.push({ id: `${category}-${i}` })
    }
  }
  
  // Add some specific known IDs
  const knownIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']
  for (const id of knownIds) {
    params.push({ id })
  }
  
  return params
}

interface ItemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ItemDetailPage(props: ItemDetailPageProps) {
  const params = await props.params;
  const listing = getListingById(params.id)

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Item not found</h1>
          <p className="text-muted-foreground mb-8">The item you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ItemDetailClient listing={listing} />
    </div>
  )
}
