import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getRound } from "@/lib/rounds";
import { requireUser } from "@/lib/auth";
import { RoundForm } from "@/components/round-form";

export const dynamic = "force-dynamic";

export default async function EditRoundPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  await requireUser();
  const { round } = await params;
  const data = await getRound(round);
  if (!data) notFound();

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
        Edit round
      </h1>
      <RoundForm round={data} />
    </div>
  );
}
