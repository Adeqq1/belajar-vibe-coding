import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, createTestSession, getAuthHeader } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';
import { db } from '../../src/config/database';
import { sessions } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('DELETE /users/logout (Protected)', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await setupTestEnvironment();
    app = createTestApp();
  });

  beforeEach(async () => {
    await beforeEachTest();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  // Success scenarios
  it('should logout successfully with valid token', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
  });

  it('should return user data on logout', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    const body = await response.json();
    expect(body.data.id).toBe(testUser.id);
    expect(body.data.email).toBe(testUser.email);
  });

  it('should delete session from database after logout', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    // Check if session is deleted
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .execute();

    expect(sessionResult.length).toBe(0);
  });

  it('should return user with expected properties', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    const body = await response.json();
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBeDefined();
    expect(body.data.email).toBeDefined();
    expect(body.data.created_at).toBeDefined();
  });

  // Error scenarios
  it('should fail when token not provided', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should fail with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader('invalid-token-12345'),
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should fail when token not in database', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader('00000000-0000-0000-0000-000000000000'),
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail with wrong Authorization header format', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${token}`,
        },
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail with empty Authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail when token already deleted', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    // First logout
    await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    // Second logout with same token
    const response = await app.handle(
      new Request('http://localhost/users/logout', {
        method: 'DELETE',
        headers: getAuthHeader(token),
      })
    );

    expect(response.status).toBe(401);
  });
});
