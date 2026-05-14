import { Elysia, t } from 'elysia';
import { CommentModel } from '../models/comment.model';

export const commentsRoutes = new Elysia({ prefix: '/comments' })
  .get('/', async ({ query }) => {
    try {
      const limit = query.limit ? Number(query.limit) : undefined;
      const offset = query.offset ? Number(query.offset) : undefined;
      const postId = query.postId ? Number(query.postId) : undefined;
      const authorId = query.authorId ? Number(query.authorId) : undefined;

      const comments = await CommentModel.findAll({
        limit,
        offset,
        postId,
        authorId,
      });

      return {
        success: true,
        data: comments,
        message: 'Comments retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve comments',
      };
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
      postId: t.Optional(t.String()),
      authorId: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Get all comments',
      description: 'Returns a list of all comments with optional filtering by postId or authorId',
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: [
                  {
                    id: 1,
                    content: 'Great post!',
                    postId: 1,
                    authorId: 1,
                    parentId: null,
                    createdAt: '2026-05-14T13:20:36.000Z',
                    updatedAt: '2026-05-14T13:20:36.000Z',
                  },
                ],
                message: 'Comments retrieved successfully',
              },
            },
          },
        },
      },
    },
  })

  .get('/:id', async ({ params: { id } }) => {
    try {
      const comment = await CommentModel.findById(Number(id));
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found',
        };
      }
      return {
        success: true,
        data: comment,
        message: 'Comment retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve comment',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Get comment by ID',
      description: 'Returns a single comment by their ID',
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  content: 'Great post!',
                  postId: 1,
                  authorId: 1,
                  parentId: null,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
                message: 'Comment retrieved successfully',
              },
            },
          },
        },
      },
    },
  })

  .post('/', async ({ body }) => {
    try {
      const comment = await CommentModel.create({
        content: body.content,
        postId: body.postId,
        authorId: body.authorId,
        parentId: body.parentId || null,
      });
      return {
        success: true,
        data: comment,
        message: 'Comment created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create comment',
      };
    }
  }, {
    body: t.Object({
      content: t.String(),
      postId: t.Number(),
      authorId: t.Number(),
      parentId: t.Optional(t.Number()),
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Create a new comment',
      description: 'Creates a new comment on a post with the provided information',
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  content: 'Great post!',
                  postId: 1,
                  authorId: 1,
                  parentId: null,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
                message: 'Comment created successfully',
              },
            },
          },
        },
      },
    },
  })

  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const comment = await CommentModel.update(Number(id), {
        content: body.content,
      });
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found',
        };
      }
      return {
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update comment',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    body: t.Object({
      content: t.String(),
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Update comment by ID',
      description: 'Updates an existing comment with the provided information',
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  content: 'Updated comment content',
                  postId: 1,
                  authorId: 1,
                  parentId: null,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T14:30:00.000Z',
                },
                message: 'Comment updated successfully',
              },
            },
          },
        },
      },
    },
  })

  .delete('/:id', async ({ params: { id } }) => {
    try {
      const comment = await CommentModel.delete(Number(id));
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found',
        };
      }
      return {
        success: true,
        data: comment,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete comment',
      };
    }
  }, {
    params: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Delete comment by ID',
      description: 'Deletes a comment permanently from the system',
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: {
                success: true,
                data: {
                  id: 1,
                  content: 'Great post!',
                  postId: 1,
                  authorId: 1,
                  parentId: null,
                  createdAt: '2026-05-14T13:20:36.000Z',
                  updatedAt: '2026-05-14T13:20:36.000Z',
                },
                message: 'Comment deleted successfully',
              },
            },
          },
        },
      },
    },
  });
