"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Mic, MicOff, Send, Sparkles, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { speakText } from "@/src/lib/speech";

const languageOptions = [
  { label: "English", value: "English", recognition: "en-US" },
  { label: "Spanish", value: "Spanish", recognition: "es-ES" },
  { label: "French", value: "French", recognition: "fr-FR" },
  { label: "German", value: "German", recognition: "de-DE" },
  { label: "Japanese", value: "Japanese", recognition: "ja-JP" },
  { label: "Italian", value: "Italian", recognition: "it-IT" },
  { label: "Portuguese", value: "Portuguese", recognition: "pt-BR" },
  { label: "Korean", value: "Korean", recognition: "ko-KR" },
];

const starterMessage = {
  role: "assistant",
  content: "Hi. I can help with quick language questions. Pick a language, speak or type, and I will reply in that language.",
};

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const currentRecognitionLanguage =
    languageOptions.find((item) => item.value === language)?.recognition || "en-US";

  const sendToAssistant = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ollama-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Assistant request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, model: data.model }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Assistant request failed";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I could not reach Ollama just now. ${message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentRecognitionLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setIsListening(false);
      if (transcript.trim()) {
        void sendToAssistant(transcript);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(event.error ? `Voice input failed: ${event.error}` : "Voice input failed.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError("");
    setIsListening(true);
    recognition.start();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-4 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">LanguageBoost AI</p>
                  <p className="text-[11px] text-muted-foreground">Powered by local Ollama</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3">
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Response language</label>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              >
                {languageOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-muted-foreground">Voice input uses the selected language. Replies stay in that language unless your message is clearly in another one.</p>
            </div>

            <div className="max-h-[380px] space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    {message.role === "assistant" && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            void speakText(message.content, language);
                          }}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        {message.model && <span className="text-[10px] text-muted-foreground">{message.model}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border px-4 py-3">
              {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendToAssistant(input);
                    }
                  }}
                  placeholder={`Ask in ${language}...`}
                  className="h-10 flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    void sendToAssistant(input);
                  }}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-[1.03]"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>
    </>
  );
}
