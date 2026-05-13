import { eq, and, desc, asc, count } from 'drizzle-orm';
import { db } from '../config/database';
import { posts, type Post, type NewPost } from '../db/schema';

export class PostModel {
  static async findAll(params?: { 
    limit?: number; 
    offset?: number;
    authorId?: number;
    status?: string;
  }) {
    if (!db) throw new Error('Database not initialized');
    
    const query = db.select().from(posts);
    
    if (params?.authorId) {
      query.where(eq(posts.authorId, params.authorId));
    }
    if (params?.status) {
      query.where(eq(posts.status, params.status));
    }
    
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
    
    const post = await db.select().from(posts).where(eq(posts.id, id)).execute();
    return post[0] || null;
  }

  static async findByAuthorId(authorId: number) {
    if (!db) throw new Error('Database not initialized');
    
    const post = await db.select().from(posts).where(eq(posts.authorId, authorId)).execute();
    return post[0] || null;
  }

  static async create(data: NewPost) {
    if (!db) throw new Error('Database not initialized');
    
    const [post] = await db.insert(posts).values(data).$returningId().execute();
    return post;
  }

  static async update(id: number, data: Partial<NewPost>) {
    if (!db) throw new Error('Database not initialized');
    
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .$returningId()
      .execute();
    return post;
  }

  static async delete(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const [post] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .$returningId()
      .execute();
    return post;
  }

  static async countByAuthorId(authorId: number) {
    if (!db) throw new Error('Database not initialized');
    
    const result = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .execute();
    return result[0]?.count || 0;
  }
}
