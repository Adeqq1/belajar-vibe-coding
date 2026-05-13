import { Elysia } from "elysia";
import { db } from "./src/db";
import { users } from "./src/db/schema";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/users", async () => {
    return await db.select().from(users);
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);