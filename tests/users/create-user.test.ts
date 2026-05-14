import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, testDataGenerators } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('POST /users', () => {
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
  it('should create user successfully with valid data', async () => {
    const data = testDataGenerators.validUser();

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
  });

  it('should return 201 status on successful creation', async () => {
    const data = testDataGenerators.validUser();

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
  });

  it('should create user with optional fields', async () => {
    const data = testDataGenerators.validUser();

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.firstName).toBe(data.firstName);
    expect(body.data.lastName).toBe(data.lastName);
  });

  it('should create user with custom role', async () => {
    const data = {
      ...testDataGenerators.validUser(),
      role: 'admin',
    };

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.role).toBe('admin');
  });

  // Error scenarios
  it('should fail when email already registered', async () => {
    const data = testDataGenerators.validUser();

    // First creation
    await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    // Second creation with same email
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 409]).toContain(response.status);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should fail when username already registered', async () => {
    const data = testDataGenerators.validUser();

    // First creation
    await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    // Second creation with same username but different email
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: `different-${Date.now()}@example.com`,
        }),
      })
    );

    expect([400, 409]).toContain(response.status);
  });

  it('should fail when username exceeds 100 characters', async () => {
    const data = {
      ...testDataGenerators.validUser(),
      username: 'a'.repeat(101),
    };

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should fail when email exceeds 255 characters', async () => {
    const data = {
      ...testDataGenerators.validUser(),
      email: `${'a'.repeat(250)}@example.com`,
    };

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when firstName exceeds 100 characters', async () => {
    const data = {
      ...testDataGenerators.validUser(),
      firstName: 'a'.repeat(101),
    };

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when lastName exceeds 100 characters', async () => {
    const data = {
      ...testDataGenerators.validUser(),
      lastName: 'a'.repeat(101),
    };

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(400);
  });

  it('should fail when required field email is missing', async () => {
    const data = testDataGenerators.validUser();
    delete (data as any).email;

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when required field username is missing', async () => {
    const data = testDataGenerators.validUser();
    delete (data as any).username;

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when required field password is missing', async () => {
    const data = testDataGenerators.validUser();
    delete (data as any).password;

    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });
});
