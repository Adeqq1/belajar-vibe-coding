import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, testDataGenerators } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('POST /auth/register', () => {
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
  it('should register user successfully with valid data', async () => {
    const data = testDataGenerators.validRegisterData();

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data).toBe('OK');
  });

  it('should return 201 status on successful registration', async () => {
    const data = testDataGenerators.validRegisterData();

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(201);
  });

  // Error scenarios
  it('should fail when email already registered', async () => {
    const data = testDataGenerators.validRegisterData();

    // First registration
    await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    // Second registration with same email
    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should fail with invalid email format', async () => {
    const data = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when password less than 6 characters', async () => {
    const data = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'pass',
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when name is empty', async () => {
    const data = {
      name: '',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when required fields are missing', async () => {
    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when name field is missing', async () => {
    const data = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when email field is missing', async () => {
    const data = {
      name: 'Test User',
      password: 'password123',
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when password field is missing', async () => {
    const data = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
    };

    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    expect([400, 422]).toContain(response.status);
  });
});
