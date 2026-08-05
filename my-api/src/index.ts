import { Hono } from "hono";
import { getDb } from "./db";
import { users } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: "https://front.sabrey.xyz", // Vue dev server
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/users", async (c) => {
  const db = getDb(c.env.DB);

  const result = await db.select().from(users);

  return c.json(result);
});

app.post("/users", async (c) => {
  const db = getDb(c.env.DB);

  const { name, password } = await c.req.json();

  const result = await db
    .insert(users)
    .values({ name, password })
    .returning();

  return c.json(result);
});
 
app.post("/login", async (c) => {
  const db = getDb(c.env.DB);

  const { name, password } = await c.req.json<{
    name: string;
    password: string;
  }>();

  const user = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.name, name),
        eq(users.password, password)
      )
    )
    .limit(1);

  if (user.length === 0) {
    return c.json(
      {
        success: false,
        message: "Invalid username or password",
      },
      401
    );
  }

  return c.json({
    success: true,
    message: "Login successful",
    user: user[0],
  });
});

export default app;