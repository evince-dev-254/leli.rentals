// Only import pg on server-side
let Pool: any = null
let PoolClient: any = null

// Dynamic import for server-side only
if (typeof window === 'undefined') {
  try {
    const pg = require('pg')
    Pool = pg.Pool
    PoolClient = pg.Client
  } catch (error) {
    console.warn('PostgreSQL not available:', error)
  }
}

// Database connection configuration
const dbConfig = {
  user: process.env.RENDER_DB_USER || process.env.POSTGRES_USER,
  host: process.env.RENDER_DB_HOST || process.env.POSTGRES_HOST,
  database: process.env.RENDER_DB_NAME || process.env.POSTGRES_DB,
  password: process.env.RENDER_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.RENDER_DB_PORT || process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
}

// Create connection pool
let pool: any = null

export const getPool = (): any => {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations are only available on the server-side')
  }
  
  if (!Pool) {
    throw new Error('PostgreSQL is not available. Please install pg package.')
  }
  
  if (!pool) {
    pool = new Pool(dbConfig)
    
    // Handle pool errors
    pool.on('error', (err: any) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }
  return pool
}

// Get a client from the pool
export const getClient = async (): Promise<any> => {
  const pool = getPool()
  return await pool.connect()
}

// Execute a query with automatic client management
export const query = async (text: string, params?: any[]): Promise<any> => {
  if (typeof window !== 'undefined') {
    throw new Error('Database queries are only available on the server-side')
  }
  
  const client = await getClient()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Execute a transaction
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  if (typeof window !== 'undefined') {
    throw new Error('Database transactions are only available on the server-side')
  }
  
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Close the pool (useful for testing or graceful shutdown)
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()')
    console.log('Database connected successfully:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Initialize database (run schema if needed)
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Database connection failed')
    }

    // Check if tables exist
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'listings', 'bookings', 'chat_sessions', 'messages')
    `)

    const existingTables = result.rows.map((row: any) => row.table_name)
    const requiredTables = ['users', 'listings', 'bookings', 'chat_sessions', 'messages']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))

    if (missingTables.length > 0) {
      console.log('Missing tables:', missingTables)
      console.log('Please run the schema.sql file to create the required tables')
    } else {
      console.log('All required tables exist')
    }
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// Export the database instance for direct use (lazy initialization)
export const db = {
  connect: async () => {
    try {
      return await getClient()
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }
}

export default {
  getPool,
  getClient,
  query,
  transaction,
  closePool,
  testConnection,
  initializeDatabase
}
