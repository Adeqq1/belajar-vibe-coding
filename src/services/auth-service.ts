import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

interface LoginUserData {
  email: string;
  password: string;
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
