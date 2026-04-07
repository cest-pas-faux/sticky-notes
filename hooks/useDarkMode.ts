"use client";

import { useState, useEffect } from "react";

const DARK_KEY = "sticky-notes-dark";

export function useDarkMode() {
  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DARK_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored !== null ? stored === "true" : prefersDark;
    setDark(isDark);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(DARK_KEY, String(dark));
  }, [dark, hydrated]);

  const toggle = () => setDark((d) => !d);

  return { dark, toggle };
}
