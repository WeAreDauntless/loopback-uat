"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { saveRound, removeRound } from "@/app/admin/actions";
import type { Round, RoundInput } from "@/lib/rounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TaskDraft = {
  title: string;
  instruction: string;
  focus: string; // one bullet per line in the form
};

function toDraft(round?: Round): {
  slug: string;
  client: string;
  title: string;
  prototypeUrl: string;
  intro: string;
  tasks: TaskDraft[];
} {
  return {
    slug: round?.slug ?? "",
    client: round?.client ?? "",
    title: round?.title ?? "",
    prototypeUrl: round?.prototypeUrl ?? "",
    intro: round?.intro ?? "",
    tasks:
      round?.tasks.map((t) => ({
        title: t.title,
        instruction: t.instruction,
        focus: (t.focus ?? []).join("\n"),
      })) ?? [{ title: "", instruction: "", focus: "" }],
  };
}

export function RoundForm({ round }: { round?: Round }) {
  const router = useRouter();
  const isEdit = Boolean(round);
  const [form, setForm] = useState(() => toDraft(round));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setTask(i: number, patch: Partial<TaskDraft>) {
    setForm((f) => ({
      ...f,
      tasks: f.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  }

  function addTask() {
    setForm((f) => ({
      ...f,
      tasks: [...f.tasks, { title: "", instruction: "", focus: "" }],
    }));
  }

  function removeTask(i: number) {
    setForm((f) => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const slug = form.slug.trim();
    if (!slug || !form.client.trim() || !form.title.trim()) {
      toast.error("Slug, client and title are required.");
      return;
    }

    const payload: RoundInput = {
      slug,
      client: form.client.trim(),
      title: form.title.trim(),
      prototypeUrl: form.prototypeUrl.trim(),
      intro: form.intro.trim() || null,
      tasks: form.tasks
        .filter((t) => t.title.trim() || t.instruction.trim())
        .map((t) => ({
          title: t.title.trim(),
          instruction: t.instruction.trim(),
          focus: t.focus
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        })),
    };

    startSave(async () => {
      try {
        await saveRound(payload);
        toast.success(isEdit ? "Round updated." : "Round created.");
        router.push("/admin");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed.");
      }
    });
  }

  function onDelete() {
    if (!round) return;
    if (!confirm(`Delete round "${round.title}"? This cannot be undone.`)) {
      return;
    }
    startDelete(async () => {
      try {
        await removeRound(round.slug);
        toast.success("Round deleted.");
        router.push("/admin");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" hint="URL segment, e.g. badger-dispatch-r1">
            <Input
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="badger-dispatch-r1"
              disabled={isEdit}
            />
          </Field>
          <Field label="Client">
            <Input
              value={form.client}
              onChange={(e) => setField("client", e.target.value)}
              placeholder="Badger Infrastructure Solutions"
            />
          </Field>
        </div>

        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Dispatch Console — Round 1"
          />
        </Field>

        <Field
          label="Prototype URL"
          hint="Served from /public, e.g. /prototypes/dispatch-portal-v20/index.html"
        >
          <Input
            value={form.prototypeUrl}
            onChange={(e) => setField("prototypeUrl", e.target.value)}
            placeholder="/prototypes/dispatch-portal-v20/index.html"
          />
        </Field>

        <Field label="Intro" hint="Optional note shown above the first task.">
          <Textarea
            value={form.intro}
            onChange={(e) => setField("intro", e.target.value)}
            rows={3}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Tasks
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addTask}>
            <Plus className="size-4" />
            Add task
          </Button>
        </div>

        {form.tasks.map((t, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                Task {i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTask(i)}
                title="Remove task"
                disabled={form.tasks.length === 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Field label="Title">
              <Input
                value={t.title}
                onChange={(e) => setTask(i, { title: e.target.value })}
              />
            </Field>
            <Field
              label="Instruction"
              hint="Blank lines become separate paragraphs."
            >
              <Textarea
                value={t.instruction}
                onChange={(e) => setTask(i, { instruction: e.target.value })}
                rows={4}
              />
            </Field>
            <Field label="Focus prompts" hint="One per line.">
              <Textarea
                value={t.focus}
                onChange={(e) => setTask(i, { focus: e.target.value })}
                rows={3}
              />
            </Field>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create round"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin")}
        >
          Cancel
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="size-4" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
