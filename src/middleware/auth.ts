import { Elysia } from 'elysia';
import { db } from '../config/database';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authMiddleware = new Elysia()
  .derive(async ({ headers, set }) => {
    try {
      // 1. Extract token dari header Authorization
      const authHeader = headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      // 2. Get token (remove "Bearer " prefix)
      const token = authHeader.substring(7);

      if (!token) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      // 3. Cari session berdasarkan token
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .execute();

      if (!sessionResult || sessionResult.length === 0) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      const session = sessionResult[0];

      // 4. Cari user berdasarkan user_id dari session
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .execute();

      if (!userResult || userResult.length === 0) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      const user = userResult[0];

      // 5. Return user untuk digunakan di route handler
      return {
        user: user,
      };
    } catch (error) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
  });
