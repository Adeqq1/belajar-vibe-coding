import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestPost } from '../helpers/setup';
import { testRequest } from '../helpers/test-utils';

describe('DELETE /comments/:id - Delete Comment', () => {
  let testUserId: number;
  let testPostId: number;
  let testCommentId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser({
      email: 'comment-deleter@test.com',
      username: 'commentdeleter',
      password: 'password123',
    });
    testUserId = user.id;

    const post = await createTestPost({
      title: 'Test Post for Deleting Comments',
      content: 'This is a test post for deleting comments',
      authorId: testUserId,
    });
    testPostId = post.id;

    // Create a test comment
    const response = await testRequest('POST', '/comments', {
      content: 'Comment to be deleted',
      postId: testPostId,
      authorId: testUserId,
    });
    testCommentId = response.body.data.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should delete comment successfully', async () => {
    // Create a new comment for deletion
    const createResponse = await testRequest('POST', '/comments', {
      content: 'Comment to delete',
      postId: testPostId,
      authorId: testUserId,
    });
    const commentId = createResponse.body.data.id;

    // Delete the comment
    const response = await testRequest('DELETE', `/comments/${commentId}`, null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(commentId);
    expect(response.body.message).toBe('Comment deleted successfully');
  });

  it('should verify comment is deleted after deletion', async () => {
    // Create a new comment for deletion
    const createResponse = await testRequest('POST', '/comments', {
      content: 'Comment to verify deletion',
      postId: testPostId,
      authorId: testUserId,
    });
    const commentId = createResponse.body.data.id;

    // Delete the comment
    await testRequest('DELETE', `/comments/${commentId}`, null);

    // Try to get the deleted comment
    const getResponse = await testRequest('GET', `/comments/${commentId}`, null);
    expect(getResponse.body.success).toBe(false);
    expect(getResponse.body.error).toBe('Comment not found');
  });

  it('should fail when deleting non-existent comment', async () => {
    const response = await testRequest('DELETE', '/comments/99999', null);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Comment not found');
  });

  it('should handle invalid ID format gracefully', async () => {
    const response = await testRequest('DELETE', '/comments/invalid', null);

    expect(response.status).toBe(422);
  });

  it('should delete comment and not affect other comments', async () => {
    // Create two comments
    const comment1Response = await testRequest('POST', '/comments', {
      content: 'Comment 1',
      postId: testPostId,
      authorId: testUserId,
    });
    const comment1Id = comment1Response.body.data.id;

    const comment2Response = await testRequest('POST', '/comments', {
      content: 'Comment 2',
      postId: testPostId,
      authorId: testUserId,
    });
    const comment2Id = comment2Response.body.data.id;

    // Delete first comment
    await testRequest('DELETE', `/comments/${comment1Id}`, null);

    // Verify first comment is deleted
    const getComment1 = await testRequest('GET', `/comments/${comment1Id}`, null);
    expect(getComment1.body.success).toBe(false);

    // Verify second comment still exists
    const getComment2 = await testRequest('GET', `/comments/${comment2Id}`, null);
    expect(getComment2.body.success).toBe(true);
    expect(getComment2.body.data.id).toBe(comment2Id);
  });

  it('should delete nested comment', async () => {
    // Create parent comment
    const parentResponse = await testRequest('POST', '/comments', {
      content: 'Parent comment',
      postId: testPostId,
      authorId: testUserId,
    });
    const parentId = parentResponse.body.data.id;

    // Create nested comment
    const nestedResponse = await testRequest('POST', '/comments', {
      content: 'Nested comment',
      postId: testPostId,
      authorId: testUserId,
      parentId: parentId,
    });
    const nestedId = nestedResponse.body.data.id;

    // Delete nested comment
    const deleteResponse = await testRequest('DELETE', `/comments/${nestedId}`, null);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Verify nested comment is deleted
    const getResponse = await testRequest('GET', `/comments/${nestedId}`, null);
    expect(getResponse.body.success).toBe(false);

    // Verify parent comment still exists
    const getParent = await testRequest('GET', `/comments/${parentId}`, null);
    expect(getParent.body.success).toBe(true);
  });
});
