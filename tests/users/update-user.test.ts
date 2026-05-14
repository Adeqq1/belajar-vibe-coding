import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, testDataGenerators } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('PUT /users/:id', () => {
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
  it('should update user successfully with valid data', async () => {
    const testUser = await createTestUser();
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.firstName).toBe('Updated');
  });

  it('should update partial fields only', async () => {
    const testUser = await createTestUser();
    const updateData = {
      firstName: 'OnlyFirstName',
    };

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.firstName).toBe('OnlyFirstName');
  });

  it('should update user email', async () => {
    const testUser = await createTestUser();
    const newEmail = `updated-${Date.now()}@example.com`;

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe(newEmail);
  });

  it('should update user role', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.role).toBe('admin');
  });

  // Error scenarios
  it('should fail when user not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/99999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test' }),
      })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should fail when email already used by another user', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${user2.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user1.email }),
      })
    );

    expect([400, 409, 500]).toContain(response.status);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should fail when username already used by another user', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${user2.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user1.username }),
      })
    );

    expect([400, 409, 500]).toContain(response.status);
  });

  it('should fail when username exceeds 100 characters', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'a'.repeat(101) }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when email exceeds 255 characters', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `${'a'.repeat(250)}@example.com` }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when firstName exceeds 100 characters', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'a'.repeat(101) }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when lastName exceeds 100 characters', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: 'a'.repeat(101) }),
      })
    );

    expect(response.status).toBe(400);
  });
});
