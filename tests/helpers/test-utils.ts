import { Elysia } from 'elysia';
import { routes } from '../../src/routes';
import { db } from '../../src/config/database';
import { users, sessions, posts, comments } from '../../src/db/schema';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create test app instance
 */
export function createTestApp() {
  return new Elysia().use(routes);
}

/**
 * Create a test user in database
 */
export async function createTestUser(data?: {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}) {
  const email = data?.email || `test-${Date.now()}@example.com`;
  const username = data?.username || `testuser-${Date.now()}`;
  const password = data?.password || 'password123';
  const firstName = data?.firstName || 'Test';
  const lastName = data?.lastName || 'User';
  const role = data?.role || 'user';

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db
    .insert(users)
    .values({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: 1,
    })
    .$returningId()
    .execute();

  return {
    id: result[0].id,
    email,
    username,
    password, // Return plain password for login tests
    firstName,
    lastName,
    role,
  };
}

/**
 * Create a test session/token for authenticated requests
 */
export async function createTestSession(userId: number) {
  const token = uuidv4();

  await db
    .insert(sessions)
    .values({
      token,
      userId,
    })
    .execute();

  return token;
}

/**
 * Get Authorization header with Bearer token
 */
export function getAuthHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Test data generators
 */
export const testDataGenerators = {
  validUser: () => ({
    email: `user-${Date.now()}@example.com`,
    username: `user-${Date.now()}`,
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  }),

  validPost: (authorId: number) => ({
    title: `Test Post ${Date.now()}`,
    content: 'This is a test post content',
    authorId,
    status: 'draft',
  }),

  validRegisterData: () => ({
    name: `Test User ${Date.now()}`,
    email: `register-${Date.now()}@example.com`,
    password: 'password123',
  }),

  validLoginData: (email: string, password: string) => ({
    email,
    password,
  }),
};

/**
 * Create a test post in database
 */
export async function createTestPost(data?: {
  title?: string;
  content?: string;
  authorId?: number;
  status?: string;
  publishedAt?: Date | null;
}) {
  if (!data?.authorId) {
    throw new Error('authorId is required');
  }

  const title = data?.title || `Test Post ${Date.now()}`;
  const content = data?.content || 'This is a test post content';
  const status = data?.status || 'draft';
  const publishedAt = data?.publishedAt === undefined ? null : data.publishedAt;

  const result = await db
    .insert(posts)
    .values({
      title,
      content,
      authorId: data.authorId,
      status,
      publishedAt,
    })
    .$returningId()
    .execute();

  return {
    id: result[0].id,
    title,
    content,
    authorId: data.authorId,
    status,
    publishedAt,
  };
}

/**
 * Make a test HTTP request to the app
 */
export async function testRequest(
  method: string,
  path: string,
  body: any,
  headers?: Record<string, string>
) {
  const app = createTestApp();
  const url = `http://localhost${path}`;
  
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await app.handle(new Request(url, requestInit));
  
  // Clone the response to read the body
  const clonedResponse = response.clone();
  const text = await clonedResponse.text();
  
  let responseBody;
  try {
    responseBody = JSON.parse(text);
  } catch (e) {
    responseBody = text;
  }

  return {
    status: response.status,
    body: responseBody,
  };
}
