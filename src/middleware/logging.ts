import { Elysia } from 'elysia';

export const loggingMiddleware = (app: Elysia) =>
  app
    .onStart(() => {
      console.log(`🚀 Server starting...`);
    })
    .onError(({ error, set }) => {
      console.error('❌ Error:', error);
      set.status = 500;
    })
    .onAfterHandle(({ request, response, set }) => {
      const duration = (Date.now() - (request as any).startTime) || 0;
      console.log(`✅ ${request.method} ${request.url} - ${set.status} (${duration}ms)`);
    });
