import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRound } from "@/lib/rounds";
import { Runner } from "@/components/runner";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ round: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { round } = await params;
  const data = await getRound(round);
  return { title: data ? `${data.title} — UAT Runner` : "Round not found" };
}

export default async function RoundPage({ params }: Params) {
  const { round } = await params;
  const data = await getRound(round);
  if (!data) notFound();

  return <Runner round={data} />;
}
