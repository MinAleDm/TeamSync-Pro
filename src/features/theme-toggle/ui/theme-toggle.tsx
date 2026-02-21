"use client";

import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";

export function ThemeToggle(): JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
