import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser, testDataGenerators } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';
import { db } from '../../src/config/database';
import { posts } from '../../src/db/schema';

describe('GET /posts', () => {
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
  it('should get all posts successfully', async () => {
    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return array of posts', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);

    await db.insert(posts).values(postData).execute();

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty array when no posts exist', async () => {
    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual([]);
  });

  it('should return success message', async () => {
    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBeDefined();
  });

  it('should return post objects with expected properties', async () => {
    const testUser = await createTestUser();
    const postData = testDataGenerators.validPost(testUser.id);

    await db.insert(posts).values(postData).execute();

    const response = await app.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    if (body.data.length > 0) {
      const post = body.data[0];
      expect(post.id).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.authorId).toBeDefined();
    }
  });
});
