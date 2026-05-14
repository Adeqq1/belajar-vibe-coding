import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestPost } from '../helpers/setup';
import { testRequest } from '../helpers/test-utils';

describe('POST /comments - Create Comment', () => {
  let testUserId: number;
  let testPostId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser({
      email: 'comment-creator@test.com',
      username: 'commentcreator',
      password: 'password123',
    });
    testUserId = user.id;

    const post = await createTestPost({
      title: 'Test Post for Comments',
      content: 'This is a test post for comments',
      authorId: testUserId,
    });
    testPostId = post.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create a comment successfully', async () => {
    const response = await testRequest('POST', '/comments', {
      content: 'This is a test comment',
      postId: testPostId,
      authorId: testUserId,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.content).toBe('This is a test comment');
    expect(response.body.data.postId).toBe(testPostId);
    expect(response.body.data.authorId).toBe(testUserId);
    expect(response.body.message).toBe('Comment created successfully');
  });

  it('should create a nested comment with parentId', async () => {
    // Create parent comment first
    const parentResponse = await testRequest('POST', '/comments', {
      content: 'Parent comment',
      postId: testPostId,
      authorId: testUserId,
    });

    const parentCommentId = parentResponse.body.data.id;

    // Create nested comment
    const response = await testRequest('POST', '/comments', {
      content: 'Reply to parent comment',
      postId: testPostId,
      authorId: testUserId,
      parentId: parentCommentId,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.parentId).toBe(parentCommentId);
    expect(response.body.data.content).toBe('Reply to parent comment');
  });

  it('should fail when content is missing', async () => {
    const response = await testRequest('POST', '/comments', {
      postId: testPostId,
      authorId: testUserId,
    });

    expect(response.status).toBe(422);
  });

  it('should fail when postId is missing', async () => {
    const response = await testRequest('POST', '/comments', {
      content: 'Test comment',
      authorId: testUserId,
    });

    expect(response.status).toBe(422);
  });

  it('should fail when authorId is missing', async () => {
    const response = await testRequest('POST', '/comments', {
      content: 'Test comment',
      postId: testPostId,
    });

    expect(response.status).toBe(422);
  });

  it('should create comment with empty parentId (null)', async () => {
    const response = await testRequest('POST', '/comments', {
      content: 'Comment without parent',
      postId: testPostId,
      authorId: testUserId,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.parentId).toBeNull();
  });
});
