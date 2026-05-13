import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '../config/database';
import { comments, type Comment, type NewComment } from '../db/schema';

export class CommentModel {
  static async findAll(params?: { 
    limit?: number; 
    offset?: number;
    postId?: number;
    authorId?: number;
  }) {
    const query = db.select().from(comments);
    
    if (params?.postId) {
      query.where(eq(comments.postId, params.postId));
    }
    if (params?.authorId) {
      query.where(eq(comments.authorId, params.authorId));
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
    const comment = await db.select().from(comments).where(eq(comments.id, id)).execute();
    return comment[0] || null;
  }

  static async findByPostId(postId: number) {
    const comment = await db.select().from(comments).where(eq(comments.postId, postId)).execute();
    return comment[0] || null;
  }

  static async create(data: NewComment) {
    const [comment] = await db.insert(comments).values(data).returning().execute();
    return comment;
  }

  static async update(id: number, data: Partial<NewComment>) {
    const [comment] = await db
      .update(comments)
      .set(data)
      .where(eq(comments.id, id))
      .returning()
      .execute();
    return comment;
  }

  static async delete(id: number) {
    const [comment] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning()
      .execute();
    return comment;
  }
}
