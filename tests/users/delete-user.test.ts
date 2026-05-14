import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestApp, createTestUser } from '../helpers/test-utils';
import { setupTestEnvironment, cleanupTestEnvironment, beforeEachTest } from '../helpers/setup';
import { db } from '../../src/config/database';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('DELETE /users/:id', () => {
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
  it('should soft delete user successfully', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'DELETE',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should set isActive to false after soft delete', async () => {
    const testUser = await createTestUser();

    await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'DELETE',
      })
    );

    // Check database
    const deletedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, testUser.id))
      .execute();

    expect(deletedUser[0].isActive).toBe(0);
  });

  it('should keep user in database after soft delete', async () => {
    const testUser = await createTestUser();

    await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'DELETE',
      })
    );

    // Check database - user should still exist
    const deletedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, testUser.id))
      .execute();

    expect(deletedUser.length).toBe(1);
  });

  it('should return deleted user data', async () => {
    const testUser = await createTestUser();

    const response = await app.handle(
      new Request(`http://localhost/users/${testUser.id}`, {
        method: 'DELETE',
      })
    );

    const body = await response.json();
    expect(body.data.id).toBe(testUser.id);
    expect(body.data.email).toBe(testUser.email);
  });

  // Error scenarios
  it('should fail when user not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/99999', {
        method: 'DELETE',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it('should return error message when user not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/users/99999', {
        method: 'DELETE',
      })
    );

    const body = await response.json();
    expect(body.error).toContain('not found');
  });
});
