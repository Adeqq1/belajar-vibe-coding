import { Elysia } from 'elysia';
import { usersRoutes } from './users';
import { postsRoutes } from './posts';
import { authRoutes } from './auth';

export const routes = new Elysia()
  .use(authRoutes)
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
