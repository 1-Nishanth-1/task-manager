"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(routes.dashboard);
    }
  }, [status, router]);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: routes.dashboard });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-zinc-50 via-zinc-50 to-zinc-100 px-4 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-100 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl dark:border-zinc-900 dark:bg-zinc-950/80">
        <h1 className="text-lg font-semibold tracking-tight">
          Sign in to FlowTasks
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Continue with your Google account to access your workspace.
        </p>
        <Button
          className="mt-6 w-full rounded-2xl text-sm"
          onClick={handleSignIn}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
