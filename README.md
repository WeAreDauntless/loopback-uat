# UAT Runner

Hosts any HTML prototype in an iframe and guides a tester through a scripted set
of tasks beside it. One link per round. Built with Next.js (App Router) +
TypeScript + Tailwind + shadcn/ui, with rounds stored in Supabase and an admin UI
to author them without a deploy.

The tester joins a Teams 1:1, shares their screen, you record (screen +
transcript), they open the round link and talk you through it as they work. The
task panel and the live prototype sit in the same frame, so the recording
documents which step they were on.

## How it works

- `/` lists the available rounds (from Supabase).
- `/<slug>` is the runner: it loads `prototype_url` into an iframe and renders
  the round's task script in a collapsible side drawer. Arrow keys move between
  tasks; `Esc` (or the chevron) collapses the panel.
- `/admin` is the authoring UI (create/edit/delete rounds). It's gated by
  Supabase Auth.
- Prototypes are static HTML served from `public/prototypes/`.

## Stack

- Next.js 16 / React 19, TypeScript
- Tailwind v4 + shadcn/ui
- Supabase (Postgres + Auth) via `@supabase/ssr`

## Setup

1. Install deps:

   ```bash
   npm install
   ```

2. Create the schema. Run `supabase/schema.sql` in the Supabase SQL editor
   (project `soobmldsdtrybhfjjpti`). It creates the `rounds` table, enables RLS
   (public read, authenticated write), and expects admins to be provisioned in
   the dashboard under Authentication > Users.

3. Fill in `.env.local` (Settings > API in the Supabase dashboard):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://soobmldsdtrybhfjjpti.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # seed script only; not deployed
   ```

4. (Optional) Seed the legacy rounds from `rounds/*.json`:

   ```bash
   npm run seed
   ```

5. Run it:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000/` for the directory, `http://localhost:3000/admin`
   to author, and `http://localhost:3000/<slug>` for a round.

## Author a new round

1. Drop the prototype under `public/prototypes/`, e.g.
   `public/prototypes/badger-dispatch/index.html`.
2. Go to `/admin`, sign in, and create a round. Set the prototype URL to the
   public path with a leading slash, e.g.
   `/prototypes/badger-dispatch/index.html`.
3. The tester's link is `https://<your-app>.vercel.app/<slug>`.

`intro` and `focus` prompts are optional. Instructions split on blank lines into
paragraphs. Nothing is rendered as raw HTML, so copy is safe to paste in.

## Run a session

1. Send the tester a Teams invite for a 1:1 they'll join on their own.
2. Have them share their screen; turn on recording (screen + transcript).
3. Send them the round link. They work through the tasks and narrate.
4. Afterwards, pull the recording and transcript from Teams / SharePoint.

## Deploy

Import the repo on Vercel (framework preset: Next.js). Add the two public env
vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Keep the
service-role key local-only — it's just for seeding.

## Data model

`rounds` (one row per round):

| column        | type        | notes                                   |
| ------------- | ----------- | --------------------------------------- |
| id            | uuid        | pk                                      |
| slug          | text        | unique; the URL segment                 |
| client        | text        |                                         |
| title         | text        |                                         |
| prototype_url | text        | path under `/public` (leading slash)    |
| intro         | text        | optional note above the first task      |
| tasks         | jsonb       | `[{ title, instruction, focus: [] }]`   |

## Later (not built yet)

In-panel notes/ratings saved per session; unique per-tester links;
click/interaction telemetry (prototypes are already same-origin under
`public/`, so this stays open).
