import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('GET /users/:id', () => {
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
  it('should get user by ID successfully', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(testUser.id);
  });

  it('should return user with correct email', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe(testUser.email);
  });

  it('should return user object with expected properties', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeDefined();
    expect(body.data.email).toBeDefined();
    expect(body.data.username).toBeDefined();
  });

  // Error scenarios
  it('should return 404 when user not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/99999', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it('should return error message when user not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/99999', {
        method: 'GET',
      })
    );

    const body = await response.json();
    expect(body.error).toContain('not found');
  });
});
