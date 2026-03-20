"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-600 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ToastProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
}

export function Toast({
  title,
  description,
  className,
  variant,
  ...props
}: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="space-y-1">
        {title && <p className="text-xs font-medium text-white">{title}</p>}
        {description && <p className="text-xs text-white/90">{description}</p>}
      </div>
    </div>
  );
}

export type ToastOptions = Omit<ToastProps, "className"> & {
  id?: string;
  duration?: number;
};

export type ToastContextValue = {
  toasts: ToastOptions[];
  toast: (toast: ToastOptions) => void;
  dismiss: (id: string) => void;
};

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastOptions[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? Math.random().toString(36).slice(2);
      const duration = options.duration ?? 3000;

      setToasts((current) => [...current, { ...options, id }]);

      if (duration > 0 && typeof window !== "undefined") {
        window.setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function Toaster() {
  const ctx = React.useContext(ToastContext);

  if (!ctx) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {ctx.toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => toast.id && ctx.dismiss(toast.id)}
            className="pointer-events-auto text-left"
          >
            <Toast {...toast} />
          </button>
        ))}
      </div>
    </div>
  );
}
