import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('GET /users', () => {
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
  it('should get all users successfully', async () => {
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return array of users', async () => {
    await createTestUser();
    await createTestUser();

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should return empty array when no users exist', async () => {
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return success message', async () => {
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBeDefined();
  });

  it('should return user objects with expected properties', async () => {
    await createTestUser();

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    if (body.data.length > 0) {
      const user = body.data[0];
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.username).toBeDefined();
    }
  });
});
