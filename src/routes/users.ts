import { Elysia, t } from 'elysia';
import { UserModel } from '../models/user.model';
import { createAuthMiddleware } from '../middleware/auth';
import { getCurrentUser } from '../services/user-service';
import { logoutUser } from '../services/auth-service';
import { db } from '../config/database';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Public routes
const publicRoutes = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    try {
      const users = await UserModel.findAll();
      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve users',
      };
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get all users',
      description: 'Returns a list of all users in the system',
    },
  })

  .get('/:id', async ({ params: { id } }) => {
    try {
      const user = await UserModel.findById(Number(id));
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve user',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Get user by ID',
      description: 'Returns a single user by their ID',
    },
  })

  .post('/', async ({ body }) => {
    try {
      const user = await UserModel.create(body);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create user',
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      username: t.String(),
      password: t.String(),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      role: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Create a new user',
      description: 'Creates a new user with the provided information',
    },
  })

  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const user = await UserModel.update(Number(id), body);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    body: t.Object({
      email: t.Optional(t.String()),
      username: t.Optional(t.String()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      role: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Update user by ID',
      description: 'Updates an existing user with the provided information',
    },
  })

  .delete('/:id', async ({ params: { id } }) => {
    try {
      const user = await UserModel.softDelete(Number(id));
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: user,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Delete user by ID',
      description: 'Soft deletes a user by setting isActive to false',
    },
  });

// Protected routes with inline auth
const protectedRoutes = new Elysia({ prefix: '/users' })
  .get('/current', async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      const token = authHeader.substring(7);

      if (!token) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .execute();

      if (!sessionResult || sessionResult.length === 0) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      const session = sessionResult[0];

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .execute();

      if (!userResult || userResult.length === 0) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      const user = userResult[0];

      return {
        data: {
          id: user.id,
          name: user.firstName,
          email: user.email,
          created_at: user.createdAt,
        },
      };
    } catch (error) {
      set.status = 401;
      return {
        error: 'Unauthorized',
      };
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get Current User',
      description: 'Get currently logged in user information based on token',
    },
  })

  .delete('/logout', async ({ headers, set }) => {
    try {
      // 1. Ambil token dari header Authorization
      const authHeader = headers.authorization;

      // 2. Validasi: Cek apakah token ada
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      const token = authHeader.substring(7);

      if (!token) {
        set.status = 401;
        return {
          error: 'Unauthorized',
        };
      }

      // 3. Panggil logoutUser(token)
      const userData = await logoutUser(token);

      // 4. Set status 200
      set.status = 200;

      // 5. Return response success
      return {
        data: userData,
      };
    } catch (error) {
      // 6. Handle error
      set.status = 401;
      return {
        error: 'Unauthorized',
      };
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'User Logout',
      description: 'Logout user and delete session token from database',
    },
  });

// Combine both route groups
export const usersRoutes = new Elysia()
  .use(publicRoutes)
  .use(protectedRoutes);
