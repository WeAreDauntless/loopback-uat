import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RoundForm } from "@/components/round-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewRoundPage() {
  await requireUser();
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-faint transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        Back to rounds
      </Link>
      <h1 className="mb-8 text-[26px] font-semibold tracking-tight">
        New round
      </h1>
      <RoundForm />
    </div>
  );
}
