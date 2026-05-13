import { Elysia } from 'elysia';

export const corsMiddleware = (app: Elysia) =>
  app.onBeforeHandle(({ headers, set }) => {
    const origin = headers.origin || '*';
    
    set.headers = {
      ...set.headers,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    } as Record<string, string>;
  });
