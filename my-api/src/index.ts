import { Hono } from "hono";
import { getDb } from "./db";
import { users } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

app.use(
  "*",
  cors({
    origin: "https://front.sabrey.xyz", // Vue dev server
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const requireAuth = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const secret = c.env.JWT_SECRET;

  if (!secret) {
    return c.json(
      { success: false, message: "JWT_SECRET is not configured" },
      500
    );
  }

  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return c.json({ success: false, message: "Login required" }, 401);
  }

  try {
    await verify(token, secret, "HS256");
  } catch {
    return c.json(
      { success: false, message: "Invalid or expired token" },
      401
    );
  }

  await next();
});

app.get("/users", requireAuth, async (c) => {
  const db = getDb(c.env.DB);

  const result = await db
    .select({ id: users.id, name: users.name })
    .from(users);

  return c.json(result);
});

app.post("/users", requireAuth ,async (c) => {
  const db = getDb(c.env.DB);

  const { name, password } = await c.req.json();

  const result = await db
    .insert(users)
    .values({ name, password })
    .returning({ id: users.id, name: users.name });

  return c.json(result);
});

app.post("/login", async (c) => {
  const secret = c.env.JWT_SECRET;

  if (!secret) {
    return c.json(
      { success: false, message: "JWT_SECRET is not configured" },
      500
    );
  }

  const db = getDb(c.env.DB);

  const { name, password } = await c.req.json<{
    name: string;
    password: string;
  }>();

  const user = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.name, name), eq(users.password, password)))
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

  const token = await sign(
    {
      sub: user[0].id,
      name: user[0].name,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    },
    secret
  );

  return c.json({
    success: true,
    message: "Login successful",
    token,
    user: user[0],
  });
});

export default app;
