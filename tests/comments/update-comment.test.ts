import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestPost } from '../helpers/setup';
import { testRequest } from '../helpers/test-utils';

describe('PUT /comments/:id - Update Comment', () => {
  let testUserId: number;
  let testPostId: number;
  let testCommentId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser({
      email: 'comment-updater@test.com',
      username: 'commentupdater',
      password: 'password123',
    });
    testUserId = user.id;

    const post = await createTestPost({
      title: 'Test Post for Updating Comments',
      content: 'This is a test post for updating comments',
      authorId: testUserId,
    });
    testPostId = post.id;

    // Create a test comment
    const response = await testRequest('POST', '/comments', {
      content: 'Original comment content',
      postId: testPostId,
      authorId: testUserId,
    });
    testCommentId = response.body.data.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should update comment successfully', async () => {
    const response = await testRequest('PUT', `/comments/${testCommentId}`, {
      content: 'Updated comment content',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(testCommentId);
    expect(response.body.data.content).toBe('Updated comment content');
    expect(response.body.message).toBe('Comment updated successfully');
  });

  it('should verify updated content persists', async () => {
    // First update
    await testRequest('PUT', `/comments/${testCommentId}`, {
      content: 'First update',
    });

    // Fetch to verify
    const getResponse = await testRequest('GET', `/comments/${testCommentId}`, null);
    expect(getResponse.body.data.content).toBe('First update');

    // Second update
    await testRequest('PUT', `/comments/${testCommentId}`, {
      content: 'Second update',
    });

    // Fetch again to verify
    const getResponse2 = await testRequest('GET', `/comments/${testCommentId}`, null);
    expect(getResponse2.body.data.content).toBe('Second update');
  });

  it('should fail when updating non-existent comment', async () => {
    const response = await testRequest('PUT', '/comments/99999', {
      content: 'Updated content',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Comment not found');
  });

  it('should fail when content is missing', async () => {
    const response = await testRequest('PUT', `/comments/${testCommentId}`, {});

    expect(response.status).toBe(422);
  });

  it('should update comment with long content', async () => {
    const longContent = 'A'.repeat(1000);
    const response = await testRequest('PUT', `/comments/${testCommentId}`, {
      content: longContent,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe(longContent);
  });

  it('should update comment with special characters', async () => {
    const specialContent = 'Comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    const response = await testRequest('PUT', `/comments/${testCommentId}`, {
      content: specialContent,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe(specialContent);
  });

  it('should preserve other fields when updating content', async () => {
    const response = await testRequest('PUT', `/comments/${testCommentId}`, {
      content: 'New content',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.postId).toBe(testPostId);
    expect(response.body.data.authorId).toBe(testUserId);
    expect(response.body.data.id).toBe(testCommentId);
  });
});
