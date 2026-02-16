import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "Address Insights",
  description: "Get walking scores, driving scores, and urban index for any address",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          <DarkModeToggle />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
