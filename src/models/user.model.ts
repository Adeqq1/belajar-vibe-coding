import { eq, and, desc, asc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '../config/database';
import { users, type User, type NewUser } from '../db/schema';

export class UserModel {
  static async findAll(params?: { limit?: number; offset?: number }) {
    if (!db) throw new Error('Database not initialized');
    
    const query = db.select().from(users);
    
    if (params?.limit) {
      query.limit(params.limit);
    }
    if (params?.offset) {
      query.offset(params.offset);
    }
    
    return await query.execute();
  }

  static async findById(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const user = await db.select().from(users).where(eq(users.id, id)).execute();
    return user[0] || null;
  }

  static async findByEmail(email: string) {
    if (!db) throw new Error('Database not initialized');
    
    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    return user[0] || null;
  }

  static async findByUsername(username: string) {
    if (!db) throw new Error('Database not initialized');
    
    const user = await db.select().from(users).where(eq(users.username, username)).execute();
    return user[0] || null;
  }

  static async create(data: NewUser) {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Insert user and get the ID
      const insertResult = await db.insert(users).values({
        ...data,
        password: hashedPassword,
      }).execute();
      
      // For MySQL, we need to get the last insert ID from the result
      // The result is an array with insert info
      if (insertResult && insertResult.length > 0) {
        // Get the user by email (since we just inserted it)
        const user = await this.findByEmail(data.email);
        return user;
      }
      
      throw new Error('Failed to create user - no insert result');
    } catch (error) {
      throw error;
    }
  }

  static async update(id: number, data: Partial<NewUser>) {
    if (!db) throw new Error('Database not initialized');
    
    await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .execute();
    
    // Return the updated user
    const user = await this.findById(id);
    return user;
  }

  static async delete(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const user = await this.findById(id);
    
    await db
      .delete(users)
      .where(eq(users.id, id))
      .execute();
    
    return user;
  }

  static async softDelete(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .execute();
    
    // Return the updated user
    const user = await this.findById(id);
    return user;
  }
}
