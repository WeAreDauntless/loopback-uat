import { createClient } from "@/lib/supabase/server";

export type Task = {
  title: string;
  instruction: string;
  focus: string[];
};

export type Round = {
  id: string;
  slug: string;
  client: string;
  title: string;
  prototypeUrl: string;
  intro: string | null;
  tasks: Task[];
};

/** Shape of a round in the authoring form / on write (no generated id). */
export type RoundInput = Omit<Round, "id">;

type RoundRow = {
  id: string;
  slug: string;
  client: string;
  title: string;
  prototype_url: string;
  intro: string | null;
  tasks: Task[] | null;
};

function rowToRound(row: RoundRow): Round {
  return {
    id: row.id,
    slug: row.slug,
    client: row.client,
    title: row.title,
    prototypeUrl: row.prototype_url,
    intro: row.intro,
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
  };
}

export async function getRounds(): Promise<Round[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToRound);
}

export async function getRound(slug: string): Promise<Round | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToRound(data) : null;
}

export async function upsertRound(input: RoundInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("rounds").upsert(
    {
      slug: input.slug,
      client: input.client,
      title: input.title,
      prototype_url: input.prototypeUrl,
      intro: input.intro,
      tasks: input.tasks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  if (error) throw new Error(error.message);
}

export async function deleteRound(slug: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("rounds").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
