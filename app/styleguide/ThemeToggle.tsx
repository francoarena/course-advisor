"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Button variant="secondary" size="sm" onClick={() => setDark((d) => !d)}>
      {dark ? <Sun size={14} weight="bold" /> : <Moon size={14} weight="bold" />}
      {dark ? "Light" : "Dark"}
    </Button>
  );
}
