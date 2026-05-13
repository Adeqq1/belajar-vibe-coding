import { createPool, Pool } from 'mysql2/promise';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
}

// Load environment variables
const DB_CONFIG: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elysia_drizzle',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create MySQL connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = createPool(DB_CONFIG);
  }
  return pool;
}

// Create Drizzle instance
export const db = drizzle(getPool(), { schema, mode: 'default' });

export function getDb() {
  return db;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export { DB_CONFIG };
