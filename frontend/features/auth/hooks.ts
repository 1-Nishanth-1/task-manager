"use client";

import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { routes } from "@/config/routes";

export function useAuthGuard() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(routes.login);
    }
  }, [status, router]);

  return { status };
}

export function useAuthActions() {
  return { signIn, signOut };
}
