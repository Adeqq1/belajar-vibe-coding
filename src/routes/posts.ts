import { Elysia, t } from 'elysia';
import { PostModel } from '../models/post.model';

export const postsRoutes = new Elysia({ prefix: '/posts' })
  .get('/', async () => {
    try {
      const posts = await PostModel.findAll();
      return {
        success: true,
        data: posts,
        message: 'Posts retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve posts',
      };
    }
  }, {
    detail: {
      tags: ['Posts'],
      summary: 'Get all posts',
      description: 'Returns a list of all posts in the system',
    },
  })

  .get('/:id', async ({ params: { id } }) => {
    try {
      const post = await PostModel.findById(Number(id));
      if (!post) {
        return {
          success: false,
          error: 'Post not found',
        };
      }
      return {
        success: true,
        data: post,
        message: 'Post retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve post',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Posts'],
      summary: 'Get post by ID',
      description: 'Returns a single post by their ID',
    },
  })

  .post('/', async ({ body }) => {
    try {
      const post = await PostModel.create({
        ...body,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      });
      return {
        success: true,
        data: post,
        message: 'Post created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create post',
      };
    }
  }, {
    body: t.Object({
      title: t.String(),
      content: t.String(),
      authorId: t.Number(),
      status: t.Optional(t.String()),
      publishedAt: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Posts'],
      summary: 'Create a new post',
      description: 'Creates a new post with the provided information',
    },
  })

  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const post = await PostModel.update(Number(id), {
        ...body,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      });
      if (!post) {
        return {
          success: false,
          error: 'Post not found',
        };
      }
      return {
        success: true,
        data: post,
        message: 'Post updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update post',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    body: t.Object({
      title: t.Optional(t.String()),
      content: t.Optional(t.String()),
      status: t.Optional(t.String()),
      publishedAt: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Posts'],
      summary: 'Update post by ID',
      description: 'Updates an existing post with the provided information',
    },
  })

  .delete('/:id', async ({ params: { id } }) => {
    try {
      const post = await PostModel.delete(Number(id));
      if (!post) {
        return {
          success: false,
          error: 'Post not found',
        };
      }
      return {
        success: true,
        data: post,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete post',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Posts'],
      summary: 'Delete post by ID',
      description: 'Deletes a post permanently from the system',
    },
  });
