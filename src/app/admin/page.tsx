import Link from "next/link";
import { Plus, ExternalLink, Pencil } from "lucide-react";
import { getRounds } from "@/lib/rounds";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();
  const rounds = await getRounds();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            UAT Runner — Admin
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight">Rounds</h1>
          {user?.email && (
            <p className="mt-1 font-mono text-xs text-faint">{user.email}</p>
          )}
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      <Link href="/admin/new">
        <Button className="mb-6">
          <Plus className="size-4" />
          New round
        </Button>
      </Link>

      <div className="flex flex-col gap-2">
        {rounds.map((r) => (
          <div
            key={r.slug}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-card px-4 py-3.5"
          >
            <div className="min-w-0">
              <div className="mb-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                {r.client} · /{r.slug}
              </div>
              <div className="truncate text-[14.5px] font-medium">
                {r.title}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/${r.slug}`} target="_blank">
                <Button variant="ghost" size="icon" title="Open runner">
                  <ExternalLink className="size-4" />
                </Button>
              </Link>
              <Link href={`/admin/${r.slug}`}>
                <Button variant="ghost" size="icon" title="Edit">
                  <Pencil className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        {rounds.length === 0 && (
          <p className="font-mono text-xs text-faint">
            No rounds yet. Create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
