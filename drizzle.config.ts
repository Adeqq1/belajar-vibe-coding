import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: `mysql://${process.env.DB_USER ?? 'root'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '3306'}/${process.env.DB_NAME ?? 'elysia_drizzle'}`,
  },
});
