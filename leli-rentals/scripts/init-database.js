import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pool } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database connection configuration
const dbConfig = {
  user: process.env.RENDER_DB_USER || process.env.POSTGRES_USER,
  host: process.env.RENDER_DB_HOST || process.env.POSTGRES_HOST,
  database: process.env.RENDER_DB_NAME || process.env.POSTGRES_DB,
  password: process.env.RENDER_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.RENDER_DB_PORT || process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

async function initializeDatabase() {
  const pool = new Pool(dbConfig)
  
  try {
    console.log('Connecting to database...')
    
    // Test connection
    const client = await pool.connect()
    console.log('✅ Database connected successfully')
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('Executing database schema...')
    await client.query(schema)
    console.log('✅ Database schema executed successfully')
    
    // Insert sample data
    console.log('Inserting sample data...')
    await insertSampleData(client)
    console.log('✅ Sample data inserted successfully')
    
    client.release()
    console.log('🎉 Database initialization completed!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

async function insertSampleData(client) {
  // Insert sample users
  const users = [
    {
      id: 'user1',
      email: 'john@example.com',
      name: 'John Mwangi',
      avatar: '/placeholder-user.jpg',
      phone: '+254700123456',
      rating: 4.9,
      verified: true
    },
    {
      id: 'user2', 
      email: 'sarah@example.com',
      name: 'Sarah Kimani',
      avatar: '/placeholder-user.jpg',
      phone: '+254700234567',
      rating: 4.8,
      verified: true
    },
    {
      id: 'user3',
      email: 'david@example.com', 
      name: 'David Ochieng',
      avatar: '/placeholder-user.jpg',
      phone: '+254700345678',
      rating: 4.7,
      verified: true
    }
  ]

  for (const user of users) {
    await client.query(`
      INSERT INTO users (id, email, name, avatar, phone, rating, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [user.id, user.email, user.name, user.avatar, user.phone, user.rating, user.verified])
  }

  // Insert sample listings
  const listings = [
    {
      id: 'listing1',
      title: 'Luxury BMW X5 SUV',
      description: 'Premium SUV perfect for family trips',
      full_description: 'This luxury BMW X5 SUV is perfect for family trips and business travel. Features include leather seats, navigation system, and premium sound system.',
      price: 15000,
      location: 'Nairobi, Kenya',
      category: 'vehicles',
      image: '/images/Luxury Sports Car.jpg',
      images: ['/images/Luxury Sports Car.jpg'],
      amenities: ['GPS Navigation', 'Leather Seats', 'Premium Sound', 'Air Conditioning'],
      rating: 4.8,
      reviews: 24,
      available: true,
      owner_id: 'user1'
    },
    {
      id: 'listing2',
      title: 'Modern 2-Bedroom Apartment',
      description: 'Contemporary apartment in prime location',
      full_description: 'Beautiful modern apartment with stunning city views. Perfect for short-term stays with all modern amenities.',
      price: 8000,
      location: 'Nairobi, Kenya', 
      category: 'homes',
      image: '/modern-apartment-city-view.png',
      images: ['/modern-apartment-city-view.png'],
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Balcony'],
      rating: 4.9,
      reviews: 18,
      available: true,
      owner_id: 'user2'
    }
  ]

  for (const listing of listings) {
    await client.query(`
      INSERT INTO listings (
        id, title, description, full_description, price, location, category,
        image, images, amenities, rating, reviews, available, owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO NOTHING
    `, [
      listing.id, listing.title, listing.description, listing.full_description,
      listing.price, listing.location, listing.category, listing.image,
      listing.images, listing.amenities, listing.rating, listing.reviews,
      listing.available, listing.owner_id
    ])
  }

  // Insert sample bookings
  const bookings = [
    {
      id: 'booking1',
      user_id: 'user2',
      owner_id: 'user1',
      listing_id: 'listing1',
      listing_title: 'Luxury BMW X5 SUV',
      listing_image: '/images/Luxury Sports Car.jpg',
      owner_name: 'John Mwangi',
      owner_avatar: '/placeholder-user.jpg',
      owner_rating: 4.9,
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-01-17'),
      duration: 2,
      total_price: 30000,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'paystack',
      payment_details: { transaction_id: 'txn_123' },
      category: 'vehicles',
      location: 'Nairobi, Kenya',
      special_requests: 'Please ensure the car is clean',
      cancellation_policy: 'Free cancellation up to 24 hours'
    }
  ]

  for (const booking of bookings) {
    await client.query(`
      INSERT INTO bookings (
        id, user_id, owner_id, listing_id, listing_title, listing_image,
        owner_name, owner_avatar, owner_rating, start_date, end_date,
        duration, total_price, status, payment_status, payment_method,
        payment_details, category, location, special_requests, cancellation_policy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (id) DO NOTHING
    `, [
      booking.id, booking.user_id, booking.owner_id, booking.listing_id,
      booking.listing_title, booking.listing_image, booking.owner_name,
      booking.owner_avatar, booking.owner_rating, booking.start_date,
      booking.end_date, booking.duration, booking.total_price, booking.status,
      booking.payment_status, booking.payment_method, JSON.stringify(booking.payment_details),
      booking.category, booking.location, booking.special_requests, booking.cancellation_policy
    ])
  }

  // Insert sample chat sessions
  const chatSessions = [
    {
      id: 'chat1',
      user_id: 'user2',
      participant_id: 'user1',
      participant_name: 'John Mwangi',
      participant_avatar: '/placeholder-user.jpg',
      participant_phone: '+254700123456',
      participant_rating: 4.9,
      participant_verified: true,
      listing_title: 'Luxury BMW X5 SUV',
      listing_image: '/images/Luxury Sports Car.jpg',
      booking_id: 'booking1',
      unread_count: 2,
      status: 'active'
    }
  ]

  for (const chat of chatSessions) {
    await client.query(`
      INSERT INTO chat_sessions (
        id, user_id, participant_id, participant_name, participant_avatar,
        participant_phone, participant_rating, participant_verified,
        listing_title, listing_image, booking_id, unread_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING
    `, [
      chat.id, chat.user_id, chat.participant_id, chat.participant_name,
      chat.participant_avatar, chat.participant_phone, chat.participant_rating,
      chat.participant_verified, chat.listing_title, chat.listing_image,
      chat.booking_id, chat.unread_count, chat.status
    ])
  }

  // Insert sample messages
  const messages = [
    {
      id: 'msg1',
      chat_session_id: 'chat1',
      sender_id: 'user1',
      receiver_id: 'user2',
      content: 'Hi! I\'ve confirmed your booking for the BMW X5. You can pick it up tomorrow at 9 AM.',
      message_type: 'text',
      read_status: false,
      booking_id: 'booking1',
      listing_id: 'listing1'
    },
    {
      id: 'msg2',
      chat_session_id: 'chat1',
      sender_id: 'user2',
      receiver_id: 'user1',
      content: 'Thank you! I\'ll be there at 9 AM sharp.',
      message_type: 'text',
      read_status: true,
      booking_id: 'booking1',
      listing_id: 'listing1'
    }
  ]

  for (const message of messages) {
    await client.query(`
      INSERT INTO messages (
        id, chat_session_id, sender_id, receiver_id, content,
        message_type, read_status, booking_id, listing_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING
    `, [
      message.id, message.chat_session_id, message.sender_id, message.receiver_id,
      message.content, message.message_type, message.read_status, message.booking_id,
      message.listing_id
    ])
  }
}

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
}

export { initializeDatabase }
