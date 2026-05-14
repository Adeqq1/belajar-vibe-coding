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
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              example: {
                data: 'OK',
              },
            },
          },
        },
      },
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
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              example: {
                data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
              },
            },
          },
        },
      },
    },
  });
