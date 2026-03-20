"use client";

import * as React from "react";
import { ToastContext, type ToastOptions } from "@/components/ui/toast";

export function useToast() {
  const ctx = React.useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }

  const toast = (options: ToastOptions) => ctx.toast(options);

  return { toast };
}
