"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Round } from "@/lib/rounds";

function paragraphs(text: string): string[] {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function Runner({ round }: { round: Round }) {
  const tasks = round.tasks;
  const total = tasks.length;

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= total) return;
      setDone((d) => ({ ...d, [index]: true }));
      setIndex(i);
    },
    [index, total],
  );

  const next = useCallback(() => {
    if (index < total - 1) goTo(index + 1);
    else setDone((d) => ({ ...d, [index]: true }));
  }, [index, total, goTo]);

  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setCollapsed((c) => !c);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const task = tasks[index];
  const pct = total ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Prototype stage */}
      <div className="relative flex-1 overflow-hidden bg-[#0e0f12]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[13px] tracking-wide text-faint">
            loading prototype…
          </div>
        )}
        {round.prototypeUrl ? (
          <iframe
            title="Prototype under test"
            src={round.prototypeUrl}
            allow="clipboard-read; clipboard-write"
            onLoad={() => setLoaded(true)}
            className="block h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[13px] text-faint">
            no prototype URL set for this round
          </div>
        )}
      </div>

      {/* Drawer */}
      <aside
        style={{ width: collapsed ? 52 : 360 }}
        className="flex shrink-0 flex-col overflow-hidden border-l border-border bg-rail transition-[width] duration-300 ease-in-out"
      >
        {collapsed ? (
          <div className="flex h-full flex-col items-center gap-4 py-3.5">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Show task panel"
              title="Show tasks"
              className="grid size-[30px] place-items-center rounded-[7px] border border-border bg-card text-muted-foreground transition-colors hover:bg-popover hover:text-foreground"
            >
              <ChevronLeft className="size-[15px]" />
            </button>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground [writing-mode:vertical-rl]">
              {index + 1} / {total}
            </div>
            <div className="relative w-[3px] flex-1 overflow-hidden rounded-[3px] bg-border">
              <div
                className="absolute inset-x-0 top-0 rounded-[3px] bg-primary transition-[height] duration-300"
                style={{ height: `${pct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Head */}
            <div className="flex shrink-0 items-center gap-2.5 border-b border-border py-3.5 pl-[18px] pr-3.5">
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {round.client}
                </div>
                <div className="mt-0.5 truncate text-[13px] font-semibold text-foreground">
                  {round.title}
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Hide task panel"
                title="Collapse panel"
                className="grid size-[30px] shrink-0 place-items-center rounded-[7px] border border-border bg-card text-muted-foreground transition-colors hover:bg-popover hover:text-foreground"
              >
                <ChevronRight className="size-[15px]" />
              </button>
            </div>

            {/* Progress */}
            <div className="shrink-0 border-b border-border px-[18px] pb-3.5 pt-4">
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Progress
                </span>
                <span className="font-mono text-[11px] text-faint">
                  {index + 1} of {total}
                </span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-[3px] bg-border">
                <div
                  className="h-full rounded-[3px] bg-primary transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Task body */}
            <div className="flex-1 overflow-y-auto px-[18px] pb-2 pt-5">
              {index === 0 && round.intro && (
                <div className="mb-[18px] rounded-[10px] border border-primary/25 bg-primary/[0.14] px-[15px] py-3.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {round.intro}
                </div>
              )}

              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary">
                Task {index + 1}
              </div>
              <h2 className="mb-3 text-[19px] font-semibold leading-tight tracking-tight">
                {task?.title || "Untitled task"}
              </h2>
              <div className="mb-5 text-[14.5px] leading-relaxed text-muted-foreground">
                {paragraphs(task?.instruction ?? "").map((p, i) => (
                  <p key={i} className="mb-2.5 last:mb-0">
                    {p}
                  </p>
                ))}
              </div>

              {task?.focus?.length ? (
                <div className="mb-4 rounded-[10px] border border-border bg-card px-[15px] pb-3.5 pt-3.5">
                  <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                    Focus your feedback on
                  </div>
                  <ul className="m-0 list-none p-0">
                    {task.focus.map((f, i) => (
                      <li
                        key={i}
                        className="relative mb-1.5 pl-4 text-[13.5px] leading-snug text-muted-foreground last:mb-0 before:absolute before:left-0 before:top-[9px] before:size-[5px] before:rounded-full before:bg-primary/70"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Nav */}
            <div className="shrink-0 border-t border-border px-[18px] pb-4 pt-3.5">
              <div className="mb-3.5 flex gap-2.5">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-popover hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 rounded-lg border border-primary bg-primary px-3 py-2.5 text-[13.5px] font-medium text-primary-foreground transition-[filter] hover:brightness-105"
                >
                  {index === total - 1 ? "Finish" : "Next task"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-[7px]">
                {tasks.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to task ${i + 1}`}
                    title={t.title || `Task ${i + 1}`}
                    className={cn(
                      "size-[9px] rounded-full transition-transform hover:scale-125",
                      i === index
                        ? "scale-[1.3] bg-primary"
                        : done[i]
                          ? "bg-done"
                          : "bg-border",
                    )}
                  />
                ))}
              </div>

              <div className="mt-3 text-xs leading-snug text-faint">
                Talk us through what you&apos;re seeing and doing as you go —
                first impressions included.
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
