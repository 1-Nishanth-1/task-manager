"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TaskView = "created" | "assigned" | "all";

interface TaskFiltersProps {
  value: TaskView;
  onChange: (view: TaskView) => void;
}

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <Tabs
      defaultValue={value}
      value={value}
      onValueChange={(v) => onChange(v as TaskView)}
    >
      <TabsList>
        <TabsTrigger value="created">Created by you</TabsTrigger>
        <TabsTrigger value="assigned">Assigned to you</TabsTrigger>
        <TabsTrigger value="all">All tasks</TabsTrigger>
      </TabsList>
      {/* Content is rendered by parent; these are just for semantics */}
      <TabsContent value={value} />
    </Tabs>
  );
}
