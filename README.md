# Elysia + Bun + Drizzle + MySQL Project

This project is a high-performance backend built with Bun, ElysiaJS, and Drizzle ORM connecting to a MySQL database.

## Prerequisites

- [Bun](https://bun.sh/) installed.
- A MySQL database instance.

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Setup environment variables:**
   Copy `.env` and fill in your MySQL connection details.
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/db_name"
   ```

3. **Generate migrations:**
   ```bash
   bunx drizzle-kit generate
   ```

4. **Run migrations:**
   ```bash
   bunx drizzle-kit push
   ```

5. **Run the development server:**
   ```bash
   bun dev
   ```
   (Note: Add `"dev": "bun run --watch index.ts"` to your `package.json` scripts if not already present).

## Project Structure

- `index.ts`: Entry point for ElysiaJS.
- `src/db/schema.ts`: Database schema definition.
- `src/db/index.ts`: Database connection instance.
- `drizzle.config.ts`: Drizzle configuration for migrations.
