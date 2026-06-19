"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          UAT Runner
        </div>
        <h1 className="mb-2.5 text-[26px] font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          We hit an unexpected error. This is often a missing or invalid
          Supabase configuration.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
