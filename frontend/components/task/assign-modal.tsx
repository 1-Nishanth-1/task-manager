"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useDebounce } from "@/hooks/useDebounce";

const assignSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (email: string) => Promise<void> | void;
  isSubmitting: boolean;
  serverError?: string | null;
}

export function AssignModal({
  open,
  onOpenChange,
  onAssign,
  isSubmitting,
  serverError,
}: AssignModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debouncedEmail = useDebounce(email, 300);

  const handleSubmit = async () => {
    const parsed = assignSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setError(null);
    await onAssign(parsed.data.email);
    setEmail("");
  };

  const debouncedValid = assignSchema.safeParse({
    email: debouncedEmail,
  }).success;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Assign task"
      description="Share ownership by assigning this task to a teammate."
      size="sm"
    >
      <div className="space-y-3 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="assign-email">Teammate email</Label>
          <Input
            id="assign-email"
            type="email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {debouncedValid
                ? "Looks good — we will validate this user on assign."
                : "We use email to find the right teammate."}
            </p>
          )}
        </div>
        {(error || serverError) && (
          <p className="text-xs text-red-500">{serverError ?? error}</p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
