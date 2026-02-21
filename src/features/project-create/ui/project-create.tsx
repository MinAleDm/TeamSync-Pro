"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/shared/ui/button";
import { useAppStore } from "@/store/use-app-store";

export function ProjectCreate(): JSX.Element {
  const createProject = useAppStore((state) => state.createProject);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createProject(name.trim(), description.trim());
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      {!isOpen ? (
        <Button onClick={() => setOpen(true)}>New project</Button>
      ) : (
        <form className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <input
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            placeholder="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
