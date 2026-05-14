import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { swagger } from '@elysiajs/swagger';
import { corsMiddleware } from './middleware/cors';
import { loggingMiddleware } from './middleware/logging';
import { errorHandlingMiddleware } from './middleware/error';
import { routes } from './routes';
import { testConnection } from './config/database';

const app = new Elysia({
  adapter: node(),
})
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Elysia + Drizzle API',
          description: 'API documentation for ElysiaJS + Drizzle ORM + MySQL project',
          version: '1.0.0',
        },
        tags: [
          { name: 'Root', description: 'Root endpoint' },
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Users', description: 'User management endpoints' },
          { name: 'Posts', description: 'Post management endpoints' },
          { name: 'Comments', description: 'Comment management endpoints' },
        ],
      },
      path: '/docs',
    })
  )
  .group('/api', (app) =>
    app
      .use(corsMiddleware)
      .use(loggingMiddleware)
      .use(errorHandlingMiddleware)
      .use(routes)
  );

// Test database connection on startup
async function startServer() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Exiting...');
      process.exit(1);
    }
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }

  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || 'localhost';

  app.listen(port, () => {
    console.log(`🚀 Elysia is running at http://${host}:${port}`);
    console.log(`📝 API Documentation available at http://${host}:${port}/docs`);
  });
}

startServer();

export type App = typeof app;
