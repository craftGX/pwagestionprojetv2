"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export default function LayoutShell({ children }: Props) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            fontSize: "12px",
          },
        }}
      />
    </>
  );
}
