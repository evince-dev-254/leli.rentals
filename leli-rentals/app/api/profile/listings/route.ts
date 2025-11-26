import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'user-listings.json')

async function readListings() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

async function writeListings(listings: any[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(listings, null, 2), 'utf-8')
}

export async function GET(request: Request) {
  const listings = await readListings()
  return NextResponse.json(listings)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const listings = await readListings()
    const newListing = {
      id: `listing-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      title: body.title || 'Untitled',
      description: body.description || '',
      price: body.price || 0,
      category: body.category || 'misc',
      image: body.image || '/placeholder.svg',
      status: body.status || 'active',
      bookings: body.bookings || 0,
      rating: body.rating || 0,
      views: body.views || 0,
      createdAt: new Date().toISOString(),
    }
    listings.unshift(newListing)
    await writeListings(listings)
    return NextResponse.json(newListing)
  } catch (err) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const listings = await readListings()
  const filtered = listings.filter((l: any) => l.id !== id)
  await writeListings(filtered)
  return NextResponse.json({ success: true })
}
