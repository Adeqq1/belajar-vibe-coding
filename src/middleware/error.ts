import { Elysia } from 'elysia';

export const errorHandlingMiddleware = (app: Elysia) =>
  app.onError(({ error, set }) => {
    console.error('Error:', error);

    if (error instanceof Error) {
      set.status = 400;
      return {
        error: 'Bad Request',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
      };
    }

    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? (error as any).message : 'Something went wrong',
    };
  });
