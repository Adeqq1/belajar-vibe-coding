import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, createTestSession, getAuthHeader } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('GET /users/current (Protected)', () => {
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
  it('should get current user with valid token', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: getAuthHeader(token),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(testUser.id);
  });

  it('should return user data matching token', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: getAuthHeader(token),
      })
    );

    const body = await response.json();
    expect(body.data.email).toBe(testUser.email);
  });

  it('should return user with expected properties', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
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
      new Request('http://localhost/users/current', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should fail with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: getAuthHeader('invalid-token-12345'),
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should fail when token not in database', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: getAuthHeader('00000000-0000-0000-0000-000000000000'),
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail with wrong Authorization header format', async () => {
    const testUser = await createTestUser();
    const token = await createTestSession(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: {
          Authorization: `Basic ${token}`,
        },
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail with empty Authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: {
          Authorization: '',
        },
      })
    );

    expect(response.status).toBe(401);
  });

  it('should fail with Bearer but no token', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/current', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ',
        },
      })
    );

    expect(response.status).toBe(401);
  });
});
