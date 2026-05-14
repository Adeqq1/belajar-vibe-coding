import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, createTestPost } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';

describe('GET /posts/:id', () => {
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
  it('should get post by ID successfully', async () => {
    const testUser = await createTestUser();
    const testPost = await createTestPost(testUser.id);

    const response = await app.handle(
      new Request(`http://localhost/posts/${testPost.id}`, {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(testPost.id);
  });

  it('should return post with correct title', async () => {
    const testUser = await createTestUser();
    const testPost = await createTestPost(testUser.id);

    const response = await app.handle(
      new Request(`http://localhost/posts/${testPost.id}`, {
        method: 'GET',
      })
    );

    const body = await response.json();
    expect(body.data.title).toBe(testPost.title);
  });

  it('should return post object with expected properties', async () => {
    const testUser = await createTestUser();
    const testPost = await createTestPost(testUser.id);

    const response = await app.handle(
      new Request(`http://localhost/posts/${testPost.id}`, {
        method: 'GET',
      })
    );

    const body = await response.json();
    expect(body.data.id).toBeDefined();
    expect(body.data.title).toBeDefined();
    expect(body.data.content).toBeDefined();
    expect(body.data.authorId).toBeDefined();
  });

  // Error scenarios
  it('should return error when post not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/posts/99999', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it('should return error message when post not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/posts/99999', {
        method: 'GET',
      })
    );

    const body = await response.json();
    expect(body.error).toContain('not found');
  });
});
