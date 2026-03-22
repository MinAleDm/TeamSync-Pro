"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Input } from "@tracker/ui";
import { apiClient } from "@/lib/api-client";
import { useUiStore } from "@/store/use-ui-store";

export function SignInForm() {
  const setSession = useUiStore((state) => state.setSession);
  const [email, setEmail] = useState("owner@tracker.local");
  const [password, setPassword] = useState("changeme123");

  const mutation = useMutation({
    mutationFn: () => apiClient.login(email, password),
    onSuccess: (session) => {
      setSession({
        accessToken: session.tokens.accessToken,
        refreshToken: session.tokens.refreshToken,
        user: session.user,
      });
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Tracker Platform</p>
        <h1 className="mt-3 text-3xl font-bold">Sign in to your workspace</h1>
        <p className="mt-3 text-sm text-muted">
          Demo credentials are prefilled so you can start exploring the board immediately.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block">Email</span>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {mutation.error ? <p className="text-sm text-rose-600">Unable to sign in. Check the API and demo seed.</p> : null}

          <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
