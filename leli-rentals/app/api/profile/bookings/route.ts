import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'user-bookings.json')

async function readBookings() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

async function writeBookings(bookings: any[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8')
}

export async function GET() {
  const bookings = await readBookings()
  return NextResponse.json(bookings)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bookings = await readBookings()
    const newBooking = {
      id: `booking-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      listingTitle: body.listingTitle || 'Untitled',
      listingImage: body.listingImage || '/placeholder.svg',
      owner: body.owner || 'Unknown',
      dates: body.dates || '',
      totalPrice: body.totalPrice || 0,
      status: body.status || 'pending',
      category: body.category || 'misc',
      location: body.location || '',
      createdAt: new Date().toISOString(),
    }
    bookings.unshift(newBooking)
    await writeBookings(bookings)
    return NextResponse.json(newBooking)
  } catch (err) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const bookings = await readBookings()
  const filtered = bookings.filter((b: any) => b.id !== id)
  await writeBookings(filtered)
  return NextResponse.json({ success: true })
}
