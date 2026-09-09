import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const dbUrl = process.env.DATABASE_URL || ''
const isSupabase = dbUrl.includes('supabase.co')

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSupabase || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err)
})

export const db = async (text: string, params?: unknown[]) => {
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default pool