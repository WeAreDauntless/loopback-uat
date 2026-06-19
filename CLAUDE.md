# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A UAT runner: it hosts a static HTML prototype in an iframe and walks a tester through a scripted task list beside it (one shareable link per "round"). Rounds live in Supabase and are authored through a gated `/admin` UI — no deploy needed to add or edit a round.

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start (serve production build)
npm run lint     # eslint (flat config: eslint.config.mjs)
npm run seed     # one-off: migrate rounds/*.json into Supabase (needs secret key)
```

There is no test suite. Verification is manual via `npm run dev`.

`.env.local` must define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both shipped to the client; use the new `sb_publishable_...` key, not the legacy anon JWT). `SUPABASE_SECRET_KEY` (the new `sb_secret_...` key, not the legacy service_role JWT) is needed only for `npm run seed` and must never be deployed.

## Stack

Next.js 16 (App Router) / React 19 / TypeScript, Tailwind v4, shadcn/ui (style `base-nova`, built on `@base-ui/react` — not Radix), Supabase (Postgres + Auth) via `@supabase/ssr`. Path alias `@/*` → `src/*`.

## Route surfaces

- `/` (`src/app/page.tsx`) — public directory of rounds.
- `/<slug>` (`src/app/[round]/page.tsx` → `Runner`) — public runner. Loads `prototype_url` in an iframe and renders the task script in a collapsible drawer. Arrow keys move between tasks; `Esc` toggles the panel. `force-dynamic`.
- `/admin/*` — auth-gated authoring (list, `/admin/new`, `/admin/[round]` edit, `/admin/login`). Mutations go through Server Actions in `src/app/admin/actions.ts`.

## Data flow

All reads/writes funnel through `src/lib/rounds.ts`. The DB uses snake_case (`prototype_url`); the app uses camelCase (`prototypeUrl`) — `rowToRound` is the single mapping boundary, so keep that conversion centralized rather than touching `prototype_url` elsewhere. `tasks` is a jsonb array of `{ title, instruction, focus: string[] }`.

Schema lives in `supabase/schema.sql` (run manually in the Supabase SQL editor). RLS: anyone can `select`; only authenticated users can write. Admins are provisioned in the Supabase dashboard (Authentication > Users) — there is no in-app signup.

## Auth is defense-in-depth — do not collapse the layers

Admin access is enforced at four independent layers, deliberately. When adding admin routes or mutations, preserve all of them:

1. **`src/proxy.ts`** redirects unauthenticated `/admin/*` requests (matcher-scoped). Note: this is Next.js 16's renamed `middleware` — the file is `proxy.ts` exporting `proxy`, not `middleware.ts`.
2. **`requireUser()` / `getCurrentUser()`** (`src/lib/auth.ts`) re-verify inside the Server Component. Per CVE-2025-29927, the proxy must never be the sole auth gate.
3. **`assertAuthed()`** in `src/app/admin/actions.ts` re-checks in every Server Action (each is an independently-invokable endpoint).
4. **RLS** in Postgres is the final backstop.

Always use `supabase.auth.getUser()` (verified against the auth server), never `getSession()`, for auth decisions.

## Supabase clients

- `src/lib/supabase/server.ts` — for Server Components / Actions (reads cookies via `next/headers`).
- `src/lib/supabase/middleware.ts` (`updateSession`) — for the proxy; refreshes the auth token. Do not insert logic between `createServerClient` and `getUser()` there, or sessions get randomly logged out.

## Prototypes

Static HTML under `public/prototypes/<name>/index.html`, referenced by a leading-slash public path (e.g. `/prototypes/badger-dispatch/index.html`) stored in `prototype_url`. They are served same-origin, so the iframe is not cross-origin sandboxed.

## Legacy seed path

`rounds/*.json` + `scripts/seed.ts` are a one-time migration of pre-Supabase rounds. New rounds are created through `/admin`, not by adding JSON files.
