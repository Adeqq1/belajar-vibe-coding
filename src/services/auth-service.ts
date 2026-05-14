import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

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
 */
export async function logoutUser(token: string): Promise<LogoutResponse> {
  try {
    // 1. Validasi: Cek apakah token ada
    if (!token) {
      throw new Error('Token tidak valid');
    }

    // 2. Cari session berdasarkan token di tabel sessions
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .execute();

    // 3. Jika session tidak ditemukan, throw error 'Unauthorized'
    if (!session) {
      throw new Error('Unauthorized');
    }

    // 4. Ambil userId dari session yang ditemukan
    const userId = session.userId;

    // 5. Cari data user berdasarkan userId di tabel users
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    // 6. Jika user tidak ditemukan, throw error
    if (!user) {
      throw new Error('Unauthorized');
    }

    // 7. Hapus session dari database
    await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .execute();

    // 8. Return data user dengan format yang benar
    return {
      id: user.id,
      name: user.username,
      email: user.email,
      created_at: user.createdAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    throw new Error(errorMessage);
  }
}
