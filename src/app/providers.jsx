"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "sonner";
import { queryClientInstance } from "@/src/lib/query-client";
import { ThemeProvider } from "@/src/lib/ThemeContext";
import { useTheme } from "@/src/lib/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { primeSpeechSynthesis } from "@/src/lib/speech";
import FloatingAssistant from "@/components/shared/FloatingAssistant";

function ThemeAwareSonner() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "light" ? "light" : "dark"}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-background text-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export function Providers({ children }) {
  useEffect(() => {
    primeSpeechSynthesis();
  }, []);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <ThemeProvider>
        {children}
        <FloatingAssistant />
        <ThemeAwareSonner />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
