import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../src";

const testEnv = { ...env, JWT_SECRET: "test-secret" };

beforeAll(async () => {
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY NOT NULL, name text NOT NULL, password text NOT NULL);"
  );
  await env.DB.exec("DELETE FROM users;");
  await env.DB.exec(
    "INSERT INTO users (id, name, password) VALUES (1, 'alice', 'secret123');"
  );
});

const login = async () => {
  const res = await app.request(
    "/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "alice", password: "secret123" }),
    },
    testEnv
  );

  return res.json<{ token: string; user: Record<string, unknown> }>();
};

describe("GET /users", () => {
  it("rejects requests without a token", async () => {
    const res = await app.request("/users", {}, testEnv);

    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await app.request(
      "/users",
      { headers: { Authorization: "Bearer not-a-real-token" } },
      testEnv
    );

    expect(res.status).toBe(401);
  });

  it("returns users without passwords when logged in", async () => {
    const { token } = await login();

    const res = await app.request(
      "/users",
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv
    );

    expect(res.status).toBe(200);

    const users = await res.json<Array<Record<string, unknown>>>();
    expect(users).toEqual([{ id: 1, name: "alice" }]);
  });
});

describe("POST /login", () => {
  it("returns a token and a user without a password", async () => {
    const body = await login();

    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({ id: 1, name: "alice" });
  });

  it("rejects wrong credentials", async () => {
    const res = await app.request(
      "/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "alice", password: "wrong" }),
      },
      testEnv
    );

    expect(res.status).toBe(401);
  });
});

describe("POST /users", () => {
  it("returns the created user without a password", async () => {
    const res = await app.request(
      "/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "bob", password: "hunter2" }),
      },
      testEnv
    );

    const user = await res.json<Array<Record<string, unknown>>>();

    expect(user).toEqual([{ id: 2, name: "bob" }]);
  });
});
