"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { routes } from "@/config/routes";
import { useAuthActions } from "@/features/auth/hooks";
import { useState } from "react";

const navItems = [
  { href: routes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.tasks, label: "Tasks", icon: ListChecks },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/70 backdrop-blur-xl dark:border-zinc-900 dark:bg-zinc-950/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href={routes.dashboard} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-zinc-900 sm:inline dark:text-zinc-50">
              FlowTasks
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50/80 p-0.5 text-xs shadow-sm md:flex dark:border-zinc-800 dark:bg-zinc-900/80">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user && (
            <div className="flex items-center gap-2">
              <Avatar
                src={session.user.image ?? undefined}
                initials={initials || ""}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex flex-1 flex-col gap-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Navigation
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </Sheet>
    </header>
  );
}
