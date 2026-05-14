import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { users, sessions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

interface LoginUserData {
  email: string;
  password: string;
}

interface LogoutResponse {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

/**
 * Login user with email and password, returns session token
 */
export async function loginUser(data: LoginUserData): Promise<string> {
  try {
    // 1. Validasi input
    if (!data.email || !data.password) {
      throw new Error('Email dan password harus diisi');
    }

    // 2. Cari user berdasarkan email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .execute();

    // 3. Cek apakah user ditemukan
    if (!user) {
      throw new Error('Username atau Password salah');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Username atau Password salah');
    }

    // 5. Generate UUID token
    const token = uuidv4();

    // 6. Insert session ke database
    await db
      .insert(sessions)
      .values({
        token: token,
        userId: user.id,
      })
      .execute();

    // 7. Return token
    return token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    throw new Error(errorMessage);
  }
}

/**
 * Logout user by deleting session token from database
 * Uses JOIN query for better performance (2 queries instead of 3)
 */
export async function logoutUser(token: string): Promise<LogoutResponse> {
  try {
    // 1. Validasi: Cek apakah token ada
    if (!token) {
      throw new Error('Token tidak valid');
    }

    // 2. Query session dan user dengan JOIN (1 query instead of 2)
    const [result] = await db
      .select({
        sessionId: sessions.id,
        userId: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .execute();

    // 3. Jika session/user tidak ditemukan, throw error 'Unauthorized'
    if (!result) {
      throw new Error('Unauthorized');
    }

    // 4. Simpan user data sebelum delete (prevent race condition)
    const userData: LogoutResponse = {
      id: result.userId,
      name: result.username,
      email: result.email,
      created_at: result.createdAt,
    };

    // 5. Hapus session dari database
    await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .execute();

    // 6. Return user data
    return userData;
  } catch (error) {
    // Log original error for debugging
    console.error('[logoutUser] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    throw new Error(errorMessage);
  }
}
