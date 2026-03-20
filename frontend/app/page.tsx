"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function Home() {
  const { status } = useSession();

  const destination =
    status === "authenticated" ? routes.dashboard : routes.login;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-zinc-50 via-zinc-50 to-zinc-100 px-4 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-medium text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
          Real-time collaborative task manager
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Ship work together with less friction.
        </h1>
        <p className="mt-3 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          FlowTasks keeps your team aligned with tasks, owners, and status
          updates that sync in real time.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href={destination}>
            <Button className="gap-2 rounded-2xl px-5 text-sm">
              {status === "authenticated"
                ? "Open dashboard"
                : "Start with Google"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
