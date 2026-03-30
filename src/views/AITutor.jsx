import React, { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Coffee,
  Languages,
  Loader2,
  MessageSquare,
  Mic,
  Mic2,
  MicOff,
  Plane,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { appClient } from "@/src/lib/app-client";
import { speakText } from "@/src/lib/speech";
import { startVoiceInput, stopVoiceInput } from "@/src/lib/voice-input";

const scenarios = [
  { id: "free", label: "Free chat", icon: MessageSquare, desc: "Open-ended conversation" },
  { id: "restaurant", label: "Restaurant", icon: Coffee, desc: "Order food and ask questions" },
  { id: "job_interview", label: "Job interview", icon: Briefcase, desc: "Practice formal conversation" },
  { id: "travel", label: "Travel", icon: Plane, desc: "Directions, bookings, and small talk" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, desc: "Prices, sizes, and preferences" },
  { id: "debate", label: "Debate", icon: Mic2, desc: "Argue a position and stay formal" },
];

const languages = ["Spanish", "French", "German", "Japanese", "Italian", "Portuguese", "Korean"];
const levels = ["Beginner", "Intermediate", "Advanced"];

const recentConversations = [
  { title: "Ordering coffee in Madrid", meta: "Spanish | 12 messages | 2 days ago" },
  { title: "Job interview practice", meta: "French | 8 messages | 4 days ago" },
  { title: "Airport directions", meta: "German | 15 messages | 1 week ago" },
];

const levelGuidance = {
  Beginner: "Short replies, clearer corrections, and slower pacing.",
  Intermediate: "Natural phrasing with concise corrections and follow-up prompts.",
  Advanced: "More nuance, richer vocabulary, and tighter conversational turns.",
};

const sessionRules = [
  "Stay in the target language unless you ask for English help.",
  "Use the mic for short replies when you want speaking practice.",
  "Corrections stay brief so the conversation keeps moving.",
];

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [language, setLanguage] = useState("Spanish");
  const [level, setLevel] = useState("Beginner");
  const [isListening, setIsListening] = useState(false);
  const [voicePending, setVoicePending] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopVoiceInput(recognitionRef);
    };
  }, []);

  const speak = (text) => {
    void speakText(text, language || "English");
  };

  const toggleListening = async () => {
    if (voicePending) return;

    if (isListening) {
      stopVoiceInput(recognitionRef);
      setIsListening(false);
      return;
    }

    setVoicePending(true);
    setError("");

    try {
      await startVoiceInput({
        language,
        recognitionRef,
        onStart: () => {
          setIsListening(true);
        },
        onResult: (transcript) => {
          setInput(transcript);
          setIsListening(false);
        },
        onError: (message) => {
          setIsListening(false);
          if (message) {
            setError(message);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    } finally {
      setVoicePending(false);
    }
  };

  const startConversation = (value) => {
    stopVoiceInput(recognitionRef);
    setScenario(value);
    setInput("");
    setError("");
    setIsListening(false);
    setMessages([
      {
        role: "assistant",
        content:
          value.id === "free"
            ? `Hello. I am your ${language} conversation tutor. Let us practice together. What would you like to talk about today?`
            : `Welcome. Let us practice a ${value.label.toLowerCase()} scenario in ${language}. Start when you are ready.`,
      },
    ]);
  };

  const resetConversation = () => {
    stopVoiceInput(recognitionRef);
    setScenario(null);
    setMessages([]);
    setInput("");
    setError("");
    setIsListening(false);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    const systemPrompt = `You are a ${language} conversation tutor. The user is a ${level} learner.
Respond naturally in ${language}, using vocabulary appropriate for ${level}.
After each user message, if there are grammar or spelling errors, add a brief
correction note formatted as: **Correction:** _original_ -> _corrected_: reason.
Keep responses conversational and under 80 words unless asked otherwise.
Current scenario: ${scenario?.label || "Free chat"}`;

    const history = nextMessages
      .slice(0, -1)
      .map((message) => `${message.role === "user" ? "User" : "Tutor"}: ${message.content}`)
      .join("\n");

    try {
      const response = await appClient.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nConversation so far:\n${history}\nUser: ${trimmed}\nTutor:`,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (invokeError) {
      const message = invokeError instanceof Error ? invokeError.message : "Tutor response failed.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I could not continue the tutoring session just now. ${message}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!scenario) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-8">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">AI Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Practice real conversations with local tutor feedback.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Choose a language</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((item) => (
                      <button
                        key={item}
                        onClick={() => setLanguage(item)}
                        className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                          language === item
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-foreground/20"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Your level</p>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((item) => (
                      <button
                        key={item}
                        onClick={() => setLevel(item)}
                        className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                          level === item
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-foreground/20"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    Session focus
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{levelGuidance[level]}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <div className="rounded-xl border border-border px-3 py-2">
                      <span className="font-medium text-foreground">Language:</span> {language}
                    </div>
                    <div className="rounded-xl border border-border px-3 py-2">
                      <span className="font-medium text-foreground">Mode:</span> Spoken conversation with inline corrections
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Pick a scenario</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {scenarios.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => startConversation(item)}
                      className="rounded-2xl border border-border bg-background/60 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <item.icon className="mb-3 h-6 w-6 text-muted-foreground" />
                      <p className="text-[16px] font-medium text-foreground">{item.label}</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Languages className="h-4 w-4 text-primary" />
                Practice plan
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Start in <span className="font-medium text-foreground">{language}</span> and keep the conversation moving.
                The tutor adapts to a <span className="font-medium text-foreground">{level.toLowerCase()}</span> learner.
              </p>
              <div className="mt-5 space-y-2">
                {sessionRules.map((rule) => (
                  <div key={rule} className="rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent conversations</p>
              <div className="mt-4 space-y-3">
                {recentConversations.map((conversation) => (
                  <div key={conversation.title} className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">{conversation.title}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{conversation.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-[calc(100dvh-12rem)] flex-col rounded-[28px] border border-border bg-card/70 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="font-syne text-lg font-bold text-foreground">
              {scenario.label} | {language}
            </h1>
            <p className="text-xs text-muted-foreground">{level} level conversation</p>
          </div>
          <Button variant="ghost" size="sm" onClick={resetConversation}>
            <Plus className="mr-1 h-4 w-4" /> New chat
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
                      message.role === "user" ? "border-primary/20 bg-primary/10" : "border-border bg-background/80"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-sm leading-body dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => speak(message.content.replace(/\*\*/g, "").replace(/\*/g, ""))}
                        className="mt-2 text-muted-foreground transition-colors hover:text-primary"
                        aria-label="Read tutor reply aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-border pt-4">
            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                disabled={voicePending}
                className={`rounded-md border p-2.5 transition-colors ${
                  isListening
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-70`}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {voicePending ? <Loader2 className="h-4 w-4 animate-spin" /> : isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={`Type in ${language}...`}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <Button onClick={() => void sendMessage()} disabled={!input.trim() || sending} size="icon" className="h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current session</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Scenario</p>
              <p className="mt-1 text-sm font-medium text-foreground">{scenario.label}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Language</p>
              <p className="mt-1 text-sm font-medium text-foreground">{language}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Level</p>
              <p className="mt-1 text-sm font-medium text-foreground">{level}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Live coaching</p>
          <p className="mt-3 text-sm text-muted-foreground">{levelGuidance[level]}</p>
          <div className="mt-4 space-y-2">
            {sessionRules.map((rule) => (
              <div key={rule} className="rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                {rule}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
