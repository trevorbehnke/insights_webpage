"use client";
import IconButton from "@mui/material/IconButton";
import Brightness3Icon from "@mui/icons-material/Brightness3";
import LightModeIcon from "@mui/icons-material/LightMode";
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
      {mode === "dark" ? <Brightness3Icon /> : <LightModeIcon />}
    </IconButton>
  );
}
