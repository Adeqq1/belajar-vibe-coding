import bcrypt from 'bcrypt';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate user registration input
 */
function validateInput(data: RegisterUserData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push({ field: 'email', message: 'Email format is invalid' });
  }

  // Validate password length (minimum 6 characters)
  if (!data.password || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return errors;
}

/**
 * Register a new user with password hashing
 */
export async function registerUser(data: RegisterUserData) {
  try {
    // 1. Validate input
    const validationErrors = validateInput(data);
    if (validationErrors.length > 0) {
      throw new Error('Validasi input gagal');
    }

    // 2. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .execute();

    if (existingUser.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    // 3. Hash password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Insert user into database
    const result = await db
      .insert(users)
      .values({
        email: data.email,
        username: data.email.split('@')[0], // Use email prefix as username
        password: hashedPassword,
        firstName: data.name,
        role: 'user',
        isActive: 1,
      })
      .$returningId()
      .execute();

    if (!result || result.length === 0) {
      throw new Error('Gagal membuat user');
    }

    // 5. Return success
    return {
      success: true,
      message: 'User berhasil didaftarkan',
      userId: result[0].id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    throw new Error(errorMessage);
  }
}

/**
 * Verify password against hashed password
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    return false;
  }
}


/**
 * Get current user information by user ID
 */
export async function getCurrentUser(userId: number) {
  try {
    const userResult = await db
      .select({
        id: users.id,
        name: users.firstName,
        email: users.email,
        created_at: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (!userResult || userResult.length === 0) {
      throw new Error('User not found');
    }

    return userResult[0];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    throw new Error(errorMessage);
  }
}
