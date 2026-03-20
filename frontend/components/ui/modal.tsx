"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md";
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className={cn(
              "relative z-50 w-full max-w-md rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-xl backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90",
              size === "sm" && "max-w-sm",
            )}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {(title || description) && (
              <div className="mb-4 space-y-1">
                {title && (
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {description}
                  </p>
                )}
              </div>
            )}
            <div>{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
