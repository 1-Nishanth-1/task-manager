"use client";

import { type ReactNode, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { getBackendToken } from "@/lib/backendToken";
import { api } from "@/lib/axios";
import { getSocket } from "@/lib/socket";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  // Bootstrap backend auth and socket connection once on the client
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getBackendToken();
      if (!token || cancelled) return;

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Ensure socket is initialized with the same token
      await getSocket();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
