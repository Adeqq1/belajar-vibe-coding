import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestPost } from '../helpers/setup';
import { testRequest } from '../helpers/test-utils';

describe('GET /comments/:id - Get Comment by ID', () => {
  let testUserId: number;
  let testPostId: number;
  let testCommentId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser({
      email: 'comment-getter-id@test.com',
      username: 'commentgetterid',
      password: 'password123',
    });
    testUserId = user.id;

    const post = await createTestPost({
      title: 'Test Post for Getting Comment by ID',
      content: 'This is a test post for getting comment by ID',
      authorId: testUserId,
    });
    testPostId = post.id;

    // Create a test comment
    const response = await testRequest('POST', '/comments', {
      content: 'Test comment for getting by ID',
      postId: testPostId,
      authorId: testUserId,
    });
    testCommentId = response.body.data.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should get comment by ID successfully', async () => {
    const response = await testRequest('GET', `/comments/${testCommentId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(testCommentId);
    expect(response.body.data.content).toBe('Test comment for getting by ID');
    expect(response.body.data.postId).toBe(testPostId);
    expect(response.body.data.authorId).toBe(testUserId);
    expect(response.body.message).toBe('Comment retrieved successfully');
  });

  it('should return error for non-existent comment ID', async () => {
    const response = await testRequest('GET', '/comments/99999', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Comment not found');
  });

  it('should return comment with all fields', async () => {
    const response = await testRequest('GET', `/comments/${testCommentId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('content');
    expect(response.body.data).toHaveProperty('postId');
    expect(response.body.data).toHaveProperty('authorId');
    expect(response.body.data).toHaveProperty('parentId');
    expect(response.body.data).toHaveProperty('createdAt');
    expect(response.body.data).toHaveProperty('updatedAt');
  });

  it('should handle invalid ID format gracefully', async () => {
    const response = await testRequest('GET', '/comments/invalid', null);

    expect(response.status).toBe(422);
  });
});
