/**
 * One-off migration: read the legacy rounds/*.json files and upsert them into
 * Supabase. Uses the service-role key to bypass RLS.
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false },
});

const roundsDir = join(process.cwd(), "rounds");

type Task = { title: string; instruction: string; focus?: string[] };
type LegacyRound = {
  round: string;
  client: string;
  title: string;
  prototypeUrl: string;
  intro?: string;
  tasks: Task[];
};

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function normalizeUrl(u: string): string {
  if (!u) return u;
  if (/^https?:\/\//.test(u)) return u;
  return u.startsWith("/") ? u : `/${u}`;
}

async function main() {
  const index = readJSON<{ rounds: { round: string }[] }>(
    join(roundsDir, "index.json"),
  );

  for (const { round } of index.rounds) {
    const cfg = readJSON<LegacyRound>(join(roundsDir, `${round}.json`));

    const row = {
      slug: cfg.round,
      client: cfg.client,
      title: cfg.title,
      prototype_url: normalizeUrl(cfg.prototypeUrl),
      intro: cfg.intro ?? null,
      tasks: cfg.tasks.map((t) => ({
        title: t.title,
        instruction: t.instruction,
        focus: t.focus ?? [],
      })),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("rounds")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`✗ ${cfg.round}: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`✓ seeded ${cfg.round}`);
    }
  }
}

main();
