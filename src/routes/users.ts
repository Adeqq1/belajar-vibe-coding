import { Elysia, t } from 'elysia';
import { UserModel } from '../models/user.model';
import { authMiddleware } from '../middleware/auth';
import { getCurrentUser } from '../services/user-service';

export const usersRoutes = new Elysia({ prefix: '/users' })
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
  })

  .use(authMiddleware)
  .get('/current', async ({ user, set }) => {
    try {
      // User sudah tersedia dari authMiddleware
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
  });
