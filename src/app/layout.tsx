import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import LayoutShell from "@/components/layout-shell";
import RegisterSW from "./registerSW";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Projets & Sessions",
  description: "Suivi simple de projets et de sessions de code",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <LayoutShell>{children}</LayoutShell>
        {/* Enregistrement PWA côté client */}
        <RegisterSW />
      </body>
    </html>
  );
}
