import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, testDataGenerators } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('POST /posts', () => {
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
  it('should create post successfully with valid data', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
  });

  it('should create post with publishedAt', async () => {
    const testUser = await createTestUser();
    const postData = {
      ...testDataGenerators.validPost(testUser.id),
      publishedAt: new Date().toISOString(),
    };

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should create post without publishedAt (null)', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);
    delete (postData as any).publishedAt;

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should create post with custom status', async () => {
    const testUser = await createTestUser();
    const postData = {
      ...testDataGenerators.validPost(testUser.id),
      status: 'published',
    };

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  // Error scenarios
  it('should fail when authorId user does not exist', async () => {
    const postData = testDataGenerators.validPost(99999);

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should fail when title is missing', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);
    delete (postData as any).title;

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when content is missing', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);
    delete (postData as any).content;

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail when authorId is missing', async () => {
    const postData = testDataGenerators.validPost(1);
    delete (postData as any).authorId;

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect([400, 422]).toContain(response.status);
  });

  it('should fail with invalid publishedAt format', async () => {
    const testUser = await createTestUser();
    const postData = {
      ...testDataGenerators.validPost(testUser.id),
      publishedAt: 'invalid-date',
    };

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});
