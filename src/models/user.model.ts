import { eq, and, desc, asc } from 'drizzle-orm';
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
    
    const [user] = await db.insert(users).values(data).$returningId().execute();
    return user;
  }

  static async update(id: number, data: Partial<NewUser>) {
    if (!db) throw new Error('Database not initialized');
    
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .$returningId()
      .execute();
    return user;
  }

  static async delete(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .$returningId()
      .execute();
    return user;
  }

  static async softDelete(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const [user] = await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .$returningId()
      .execute();
    return user;
  }
}
