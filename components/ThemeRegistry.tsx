"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeModeProvider from "@/components/ThemeContext";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
