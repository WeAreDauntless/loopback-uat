import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRounds, type Round } from "@/lib/rounds";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let rounds: Round[] = [];
  let loadError: string | null = null;

  try {
    rounds = await getRounds();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load rounds.";
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          UAT Runner
        </div>
        <h1 className="mb-2.5 text-[26px] font-semibold tracking-tight">
          Pick a test round
        </h1>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          Open the link your contact at Dauntless shared with you. If you have
          it, choose a round below.
        </p>

        <div className="flex flex-col gap-2">
          {rounds.map((r) => (
            <Link
              key={r.slug}
              href={`/${r.slug}`}
              className="group flex items-center justify-between gap-3 rounded-[10px] border border-border bg-card px-4 py-3.5 transition-colors hover:border-[#3a404c] hover:bg-popover"
            >
              <span className="min-w-0">
                <span className="mb-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                  {r.client}
                </span>
                <span className="block truncate text-[14.5px] font-medium text-foreground">
                  {r.title}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-foreground" />
            </Link>
          ))}
        </div>

        {rounds.length === 0 && !loadError && (
          <p className="mt-5 font-mono text-xs text-faint">
            No rounds yet. Create one in the{" "}
            <Link href="/admin" className="text-primary underline">
              admin
            </Link>
            .
          </p>
        )}

        {loadError && (
          <p className="mt-5 font-mono text-xs text-faint">
            Couldn&apos;t reach Supabase. Check your environment keys.
            <br />
            {loadError}
          </p>
        )}
      </div>
    </div>
  );
}
