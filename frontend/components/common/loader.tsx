"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function Loader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-2xl" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-3xl border border-zinc-100 bg-white/60 p-4 dark:border-zinc-900 dark:bg-zinc-900/60"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
