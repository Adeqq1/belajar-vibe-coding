import { Elysia } from 'elysia';
import { usersRoutes } from './users';
import { postsRoutes } from './posts';

export const routes = new Elysia({ prefix: '/api' })
  .use(usersRoutes)
  .use(postsRoutes)
  .get('/', ({ set }) => {
    set.status = 302;
    set.redirect = '/docs';
  }, {
    detail: {
      tags: ['Root'],
      summary: 'Root endpoint',
      description: 'Redirects to API documentation',
    },
  });
