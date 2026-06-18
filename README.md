# UAT Runner

A thin wrapper that hosts any HTML prototype in an iframe and guides a tester
through a scripted set of tasks beside it. One link per round. No build step,
no database, no auth — just static files on Vercel.

The tester joins a Teams 1:1, shares their screen, you record (screen +
transcript), they open the round link and talk you through it as they work.
The task panel and the live prototype sit in the same frame, so the recording
documents which step they were on.

## How it works

- `index.html` is the runner. It reads `?round=<name>` from the URL, fetches
  `rounds/<name>.json`, loads the prototype into the iframe, and renders the
  task script in the side drawer.
- With no `?round=` it shows a directory of rounds from `rounds/index.json`.
- The drawer collapses to a thin rail (button, `Esc`, or the chevron) so the
  prototype gets near-full width. Arrow keys move between tasks.

## Author a new round

1. Drop the prototype somewhere this project can serve it — easiest is a folder
   under `prototypes/`, e.g. `prototypes/badger-dispatch/index.html`.
   (External URLs work too, but same-origin keeps the door open to interaction
   tracking later.)
2. Copy an existing file in `rounds/` to `rounds/<your-round>.json` and edit it:

   ```json
   {
     "round": "badger-dispatch-r2",
     "client": "Badger Infrastructure Solutions",
     "title": "Dispatch Console — Round 2",
     "prototypeUrl": "prototypes/badger-dispatch/index.html",
     "intro": "Optional note shown above the first task.",
     "tasks": [
       {
         "title": "Short imperative task name",
         "instruction": "What to do. Blank lines become separate paragraphs.",
         "focus": ["A question to react to", "Another prompt"]
       }
     ]
   }
   ```

3. Add the round to `rounds/index.json` so it appears on the landing page.
4. Redeploy. The tester's link is `https://<your-app>.vercel.app/?round=badger-dispatch-r2`.

`intro` and `focus` are optional. `instruction` splits on blank lines into
paragraphs. Nothing is rendered as raw HTML, so copy is safe to paste in.

## Run a session

1. Send the tester a Teams invite for a 1:1 they'll join on their own.
2. Have them share their screen; turn on recording (screen + transcript).
3. Send them the round link. They work through the tasks and narrate.
4. Afterwards, pull the recording and transcript from Teams / SharePoint.

## Preview locally

`fetch()` needs http, not `file://`, so serve the folder:

```bash
npx serve .        # or: python3 -m http.server
```

Then open `http://localhost:3000/?round=badger-dispatch-r1`.

## Deploy

Push the folder to a repo and import it on Vercel as a static project (no
framework, no build command, output = root). Or `vercel` from this directory.

## Not built yet (deliberate)

Phase 2, when it earns its place: Supabase-backed configs + an admin form so
non-devs author rounds without a deploy; in-panel notes/ratings saved per
session; unique per-tester links; click/interaction telemetry (needs prototypes
on the same origin as the runner — already the case if you host under
`prototypes/`).
