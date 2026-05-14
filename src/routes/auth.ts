import { Elysia, t } from 'elysia';
import { registerUser } from '../services/user-service';
import { loginUser } from '../services/auth-service';

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
  })

  .post('/login', async ({ body, set }) => {
    try {
      const token = await loginUser({
        email: body.email,
        password: body.password,
      });

      set.status = 200;
      return {
        data: token,
      };
    } catch (error) {
      set.status = 400;
      return {
        error: 'Username atau Password salah',
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 1 }),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'User Login',
      description: 'Login user with email and password, returns session token',
    },
  });
