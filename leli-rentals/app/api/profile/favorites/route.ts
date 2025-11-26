import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Simple in-memory storage (replace with database in production)
// In a real app, this would use Supabase or another database
const favoritesStore = new Map<string, any[]>()

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userFavorites = favoritesStore.get(user.id) || []
    return NextResponse.json(userFavorites)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const userFavorites = favoritesStore.get(user.id) || []
    const newFav = {
      id: `fav-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      userId: user.id,
      listingId: body.listingId || body.id || `listing-${Date.now()}`,
      title: body.title || 'Untitled',
      description: body.description || '',
      price: body.price || 0,
      category: body.category || 'misc',
      image: body.image || '/placeholder.svg',
      rating: body.rating || 0,
      reviews: body.reviews || 0,
      location: body.location || '',
      owner: body.owner || body.ownerName || '',
      ownerName: body.ownerName || body.owner || '',
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      createdAt: new Date().toISOString(),
      addedDate: new Date().toISOString(),
    }
    userFavorites.unshift(newFav)
    favoritesStore.set(user.id, userFavorites)
    return NextResponse.json(newFav)
  } catch (err) {
    console.error('Error adding favorite:', err)
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    
    const userFavorites = favoritesStore.get(user.id) || []
    const filtered = userFavorites.filter((f: any) => f.id !== id)
    favoritesStore.set(user.id, filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting favorite:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
