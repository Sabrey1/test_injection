# my-api

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

## Login / auth

`POST /login` returns a JWT `token` plus the user (`id`, `name` only).
Send it to protected routes as `Authorization: Bearer <token>`.

`GET /users` requires that token and returns only `id` and `name`.

Local development reads `JWT_SECRET` from `.dev.vars`. For a deployed Worker,
set the same secret before deploying:

```txt
npx wrangler secret put JWT_SECRET
```

If the secret is missing, `/login` and `/users` return `500`.

## Tests

```txt
npm test
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
