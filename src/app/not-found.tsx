import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          UAT Runner
        </div>
        <h1 className="mb-2.5 text-[26px] font-semibold tracking-tight">
          Round not found
        </h1>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          We couldn&apos;t load that round. Check the link, or pick one from the
          directory.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-[10px] border border-border bg-card px-4 py-3 text-[14.5px] font-medium transition-colors hover:bg-popover"
        >
          Back to rounds
        </Link>
      </div>
    </div>
  );
}
