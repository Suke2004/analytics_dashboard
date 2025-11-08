"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (mounted) {
      const root = document.documentElement;
      if (isDark) {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      setIsDark(!isDark);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className='p-2 rounded-lg bg-card border border-border hover:border-cyan-500/30 transition-colors text-muted-foreground hover:text-cyan-300'
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      {isDark ? (
        <Sun className='w-5 h-5' />
      ) : (
        <Moon className='w-5 h-5' />
      )}
    </button>
  );
}
