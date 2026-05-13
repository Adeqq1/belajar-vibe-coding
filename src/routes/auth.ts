import { Elysia, t } from 'elysia';
import { registerUser } from '../services/user-service';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set }) => {
    try {
      const result = await registerUser({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      set.status = 201;
      return {
        data: 'OK',
      };
    } catch (error) {
      set.status = 400;
      const errorMessage = error instanceof Error ? error.message : 'Username atau Password salah';
      return {
        error: errorMessage,
      };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'User Registration',
      description: 'Register a new user with email and password',
    },
  });
