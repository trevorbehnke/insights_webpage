"use client";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "@/components/ThemeContext";

export default function DarkModeToggle() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <IconButton
      onClick={toggleMode}
      color="inherit"
      aria-label="Toggle dark mode"
      sx={{ position: "fixed", top: 16, right: 16, zIndex: 1200 }}
    >
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
