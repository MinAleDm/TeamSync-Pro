"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Textarea } from "@tracker/ui";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function ProjectCreate({ organizationId }: { organizationId: string }) {
  const [keyValue, setKeyValue] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.createProject({
        organizationId,
        key: keyValue.toUpperCase(),
        name,
        description,
      }),
    onSuccess: async () => {
      setKeyValue("");
      setName("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects(organizationId) });
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-muted/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">New project</p>
      <div className="mt-3 grid gap-3">
        <Input placeholder="Key" value={keyValue} onChange={(event) => setKeyValue(event.target.value)} />
        <Input placeholder="Project name" value={name} onChange={(event) => setName(event.target.value)} />
        <Textarea
          rows={3}
          placeholder="Short description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button
          variant="secondary"
          disabled={mutation.isPending || !keyValue.trim() || !name.trim()}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Creating..." : "Create project"}
        </Button>
      </div>
    </div>
  );
}
