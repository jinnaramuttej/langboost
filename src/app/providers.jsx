"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/src/lib/query-client";
import { ThemeProvider } from "@/src/lib/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { primeSpeechSynthesis } from "@/src/lib/speech";
import FloatingAssistant from "@/components/shared/FloatingAssistant";

export function Providers({ children }) {
  useEffect(() => {
    primeSpeechSynthesis();
  }, []);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <ThemeProvider>
        {children}
        <FloatingAssistant />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
