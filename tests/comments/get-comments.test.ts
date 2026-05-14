import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestPost } from '../helpers/setup';
import { testRequest } from '../helpers/test-utils';

describe('GET /comments - Get All Comments', () => {
  let testUserId: number;
  let testPostId: number;
  let commentIds: number[] = [];

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser({
      email: 'comment-getter@test.com',
      username: 'commentgetter',
      password: 'password123',
    });
    testUserId = user.id;

    const post = await createTestPost({
      title: 'Test Post for Getting Comments',
      content: 'This is a test post for getting comments',
      authorId: testUserId,
    });
    testPostId = post.id;

    // Create multiple comments
    for (let i = 0; i < 3; i++) {
      const response = await testRequest('POST', '/comments', {
        content: `Test comment ${i + 1}`,
        postId: testPostId,
        authorId: testUserId,
      });
      commentIds.push(response.body.data.id);
    }
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should get all comments', async () => {
    const response = await testRequest('GET', '/comments', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    expect(response.body.message).toBe('Comments retrieved successfully');
  });

  it('should get comments with limit', async () => {
    const response = await testRequest('GET', '/comments?limit=2', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  it('should get comments with offset', async () => {
    // Create multiple comments first
    for (let i = 0; i < 5; i++) {
      await testRequest('POST', '/comments', {
        content: `Offset test comment ${i}`,
        postId: testPostId,
        authorId: testUserId,
      });
    }

    const response = await testRequest('GET', '/comments?offset=2', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should filter comments by postId', async () => {
    const response = await testRequest('GET', `/comments?postId=${testPostId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    // All returned comments should belong to the test post
    response.body.data.forEach((comment: any) => {
      expect(comment.postId).toBe(testPostId);
    });
  });

  it('should filter comments by authorId', async () => {
    const response = await testRequest('GET', `/comments?authorId=${testUserId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    // All returned comments should be authored by the test user
    response.body.data.forEach((comment: any) => {
      expect(comment.authorId).toBe(testUserId);
    });
  });

  it('should filter comments by both postId and authorId', async () => {
    const response = await testRequest('GET', `/comments?postId=${testPostId}&authorId=${testUserId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    response.body.data.forEach((comment: any) => {
      expect(comment.postId).toBe(testPostId);
      expect(comment.authorId).toBe(testUserId);
    });
  });

  it('should return empty array for non-existent postId', async () => {
    const response = await testRequest('GET', '/comments?postId=99999', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
