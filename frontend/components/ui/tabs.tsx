"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TabsValue = string;

interface TabsContextValue {
  value: TabsValue;
  setValue: (value: TabsValue) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue: TabsValue;
  value?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] =
    React.useState<TabsValue>(defaultValue);
  const value = controlledValue ?? uncontrolled;

  const setValue = (next: TabsValue) => {
    if (!controlledValue) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full bg-zinc-100 p-1 text-xs dark:bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: TabsValue;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-zinc-500 transition-colors",
        isActive &&
          "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabsValue;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within <Tabs>");

  if (ctx.value !== value) return null;

  return <div className={cn("mt-2", className)} {...props} />;
}
