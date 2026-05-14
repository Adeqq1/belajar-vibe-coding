import { Elysia } from 'elysia';
import { db } from '../config/database';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createAuthMiddleware = () => {
  return new Elysia()
    .derive(async ({ headers, set }) => {
      const authHeader = headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      const token = authHeader.substring(7);

      if (!token) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      try {
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

        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .execute();

        if (!userResult || userResult.length === 0) {
          set.status = 401;
          throw new Error('Unauthorized');
        }

        return {
          user: userResult[0],
        };
      } catch (error) {
        set.status = 401;
        throw new Error('Unauthorized');
      }
    })
    .onError(({ code, error, set }) => {
      if (error.message === 'Unauthorized') {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }
    });
};




