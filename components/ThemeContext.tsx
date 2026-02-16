"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Mode = "light" | "dark";

const ThemeModeContext = createContext<{
  mode: Mode;
  toggleMode: () => void;
}>({ mode: "light", toggleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

const STORAGE_KEY = "theme-mode";

export default function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === "dark" || stored === "light") setMode(stored);
    setMounted(true);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#3f51b5" },
          secondary: { main: "#009688" },
          ...(mode === "dark"
            ? { background: { default: "#121212", paper: "#1e1e1e" } }
            : { background: { default: "#f5f5f5" } }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
