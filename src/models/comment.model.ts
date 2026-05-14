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
    try {
      let query = db.select().from(comments);
      
      const conditions = [];
      if (params?.postId) {
        conditions.push(eq(comments.postId, params.postId));
      }
      if (params?.authorId) {
        conditions.push(eq(comments.authorId, params.authorId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // MySQL requires LIMIT when using OFFSET
      if (params?.limit) {
        query = query.limit(params.limit);
      } else if (params?.offset) {
        // If offset is provided but no limit, use a large limit
        query = query.limit(10000);
      }
      
      if (params?.offset) {
        query = query.offset(params.offset);
      }
      
      const result = await query.execute();
      return result;
    } catch (error) {
      console.error('Error in CommentModel.findAll:', error);
      throw error;
    }
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
    try {
      // Insert comment
      const insertResult = await db.insert(comments).values(data).execute();
      
      // For MySQL, we need to get the last insert ID
      // Get the comment by finding the most recent one with matching data
      if (insertResult && insertResult.length > 0) {
        // Query the most recent comment with the same postId and authorId
        const result = await db
          .select()
          .from(comments)
          .where(
            and(
              eq(comments.postId, data.postId),
              eq(comments.authorId, data.authorId),
              eq(comments.content, data.content)
            )
          )
          .execute();
        
        return result[result.length - 1] || null;
      }
      
      throw new Error('Failed to create comment - no insert result');
    } catch (error) {
      throw error;
    }
  }

  static async update(id: number, data: Partial<NewComment>) {
    try {
      await db
        .update(comments)
        .set(data)
        .where(eq(comments.id, id))
        .execute();
      
      // Return the updated comment
      const comment = await this.findById(id);
      return comment;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: number) {
    try {
      const comment = await this.findById(id);
      
      await db
        .delete(comments)
        .where(eq(comments.id, id))
        .execute();
      
      return comment;
    } catch (error) {
      throw error;
    }
  }
}
