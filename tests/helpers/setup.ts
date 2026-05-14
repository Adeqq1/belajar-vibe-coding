import { db } from '../../src/config/database';
import { users, posts, sessions, comments } from '../../src/db/schema';

/**
 * Clear all data from database tables
 * Order matters: delete dependent tables first
 */
export async function clearDatabase() {
  try {
    // Delete in order of foreign key dependencies
    await db.delete(comments).execute();
    await db.delete(sessions).execute();
    await db.delete(posts).execute();
    await db.delete(users).execute();
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Setup test environment before running tests
 */
export async function setupTestEnvironment() {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
}

/**
 * Cleanup test environment after running tests
 */
export async function cleanupTestEnvironment() {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
    throw error;
  }
}

/**
 * Setup before each test
 */
export async function beforeEachTest() {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('Error in beforeEachTest:', error);
    throw error;
  }
}
