import { Elysia, t } from 'elysia';
import { UserModel } from '../models/user.model';
import { createAuthMiddleware } from '../middleware/auth';
import { getCurrentUser } from '../services/user-service';
import { logoutUser } from '../services/auth-service';
import { db } from '../config/database';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Helper function to extract Bearer token from Authorization header
 */
function extractToken(headers: any): string | null {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return token || null;
}

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
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: [
                  {
                    id: 1,
                    email: 'john@example.com',
                    username: 'john_doe',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'user',
                    isActive: true,
                    createdAt: '2026-05-14T13:20:36.000Z',
                    updatedAt: '2026-05-14T13:20:36.000Z',
                  },
                ],
                message: 'Users retrieved successfully',
              },
            },
          },
        },
      },
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
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  email: 'john@example.com',
                  username: 'john_doe',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'user',
                  isActive: true,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
                message: 'User retrieved successfully',
              },
            },
          },
        },
      },
    },
  })

  .post('/', async ({ body, set }) => {
    try {
      // Test: throw error to see if handler is called
      if (body.username && body.username.length > 100) {
        throw new Error(`Username too long: ${body.username.length} characters`);
      }

      // Validate username length - MUST be before create
      if (!body.username || body.username.length === 0) {
        set.status = 400;
        return {
          success: false,
          error: 'Username is required',
        };
      }

      if (body.username.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'Username must not exceed 100 characters',
          details: {
            field: 'username',
            maxLength: 100,
            actualLength: body.username.length,
          },
        };
      }

      // Validate email length
      if (!body.email || body.email.length === 0) {
        set.status = 400;
        return {
          success: false,
          error: 'Email is required',
        };
      }

      if (body.email.length > 255) {
        set.status = 400;
        return {
          success: false,
          error: 'Email must not exceed 255 characters',
          details: {
            field: 'email',
            maxLength: 255,
            actualLength: body.email.length,
          },
        };
      }

      // Validate firstName length if provided
      if (body.firstName && body.firstName.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'First name must not exceed 100 characters',
          details: {
            field: 'firstName',
            maxLength: 100,
            actualLength: body.firstName.length,
          },
        };
      }

      // Validate lastName length if provided
      if (body.lastName && body.lastName.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'Last name must not exceed 100 characters',
          details: {
            field: 'lastName',
            maxLength: 100,
            actualLength: body.lastName.length,
          },
        };
      }

      // All validations passed, create user
      const user = await UserModel.create(body);
      set.status = 201;
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error: any) {
      // Handle duplicate email/username
      if (error.code === 'ER_DUP_ENTRY') {
        set.status = 409;
        return {
          success: false,
          error: 'Email or username already exists',
          details: {
            code: 'DUPLICATE_ENTRY',
          },
        };
      }

      // Handle data too long error
      if (error.code === 'ER_DATA_TOO_LONG') {
        set.status = 400;
        return {
          success: false,
          error: 'Data too long for one or more fields',
          details: {
            code: 'DATA_TOO_LONG',
            message: error.message,
          },
        };
      }

      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to create user',
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
      description: 'Creates a new user with the provided information. Username max 100 chars, email max 255 chars, firstName/lastName max 100 chars each.',
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  email: 'john@example.com',
                  username: 'john_doe',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'user',
                  isActive: true,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
                message: 'User created successfully',
              },
            },
          },
        },
      },
    },
  })

  .put('/:id', async ({ params: { id }, body, set }) => {
    try {
      // Validate username length if provided
      if (body.username && body.username.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'Username must not exceed 100 characters',
          details: {
            field: 'username',
            maxLength: 100,
            actualLength: body.username.length,
          },
        };
      }

      // Validate email length if provided
      if (body.email && body.email.length > 255) {
        set.status = 400;
        return {
          success: false,
          error: 'Email must not exceed 255 characters',
          details: {
            field: 'email',
            maxLength: 255,
            actualLength: body.email.length,
          },
        };
      }

      // Validate firstName length if provided
      if (body.firstName && body.firstName.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'First name must not exceed 100 characters',
          details: {
            field: 'firstName',
            maxLength: 100,
            actualLength: body.firstName.length,
          },
        };
      }

      // Validate lastName length if provided
      if (body.lastName && body.lastName.length > 100) {
        set.status = 400;
        return {
          success: false,
          error: 'Last name must not exceed 100 characters',
          details: {
            field: 'lastName',
            maxLength: 100,
            actualLength: body.lastName.length,
          },
        };
      }

      const user = await UserModel.update(Number(id), body);
      if (!user) {
        set.status = 404;
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
    } catch (error: any) {
      console.error('Error updating user:', error);

      // Handle duplicate email/username
      if (error.code === 'ER_DUP_ENTRY') {
        set.status = 409;
        return {
          success: false,
          error: 'Email or username already exists',
          details: {
            code: 'DUPLICATE_ENTRY',
          },
        };
      }

      // Handle data too long error
      if (error.code === 'ER_DATA_TOO_LONG') {
        set.status = 400;
        return {
          success: false,
          error: 'Data too long for one or more fields',
          details: {
            code: 'DATA_TOO_LONG',
            message: error.message,
          },
        };
      }

      set.status = 500;
      return {
        success: false,
        error: 'Failed to update user',
        details: {
          message: error.message,
        },
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
      description: 'Updates an existing user with the provided information. Username max 100 chars, email max 255 chars, firstName/lastName max 100 chars each.',
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  email: 'john.updated@example.com',
                  username: 'john_doe_updated',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'user',
                  isActive: true,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T14:30:00.000Z',
                },
                message: 'User updated successfully',
              },
            },
          },
        },
      },
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
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  email: 'john@example.com',
                  username: 'john_doe',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'user',
                  isActive: false,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T14:30:00.000Z',
                },
                message: 'User deleted successfully',
              },
            },
          },
        },
      },
    },
  });

// Protected routes with inline auth
const protectedRoutes = new Elysia({ prefix: '/users' })
  .get('/current', async ({ headers, set }) => {
    try {
      const token = extractToken(headers);

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
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                data: {
                  id: 1,
                  name: 'John',
                  email: 'john@example.com',
                  created_at: '2026-05-14T13:20:36.000Z',
                },
              },
            },
          },
        },
      },
    },
  })

  .delete('/logout', async ({ headers, set }) => {
    try {
      // 1. Extract token dari Authorization header
      const token = extractToken(headers);

      // 2. Validasi: Cek apakah token ada
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
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              example: {
                data: {
                  id: 1,
                  email: 'john@example.com',
                  username: 'john_doe',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'user',
                  isActive: true,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
              },
            },
          },
        },
      },
    },
  });

// Combine both route groups
export const usersRoutes = new Elysia()
  .use(publicRoutes)
  .use(protectedRoutes);
