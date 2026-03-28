import React, { useEffect, useRef, useState } from "react";
import { Briefcase, Coffee, MessageSquare, Mic, Mic2, MicOff, Plane, Plus, Send, ShoppingBag, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { appClient } from "@/src/lib/app-client";
import { speakText } from "@/src/lib/speech";

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

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [language, setLanguage] = useState("Spanish");
  const [level, setLevel] = useState("Beginner");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text) => {
    void speakText(text, language || "English");
  };

  const toggleListening = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langMap = {
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Japanese: "ja-JP",
      Italian: "it-IT",
      Portuguese: "pt-BR",
      Korean: "ko-KR",
    };
    recognition.lang = langMap[language] || "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const startConversation = (value) => {
    setScenario(value);
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

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const systemPrompt = `You are a ${language} conversation tutor. The user is a ${level} learner.
Respond naturally in ${language}, using vocabulary appropriate for ${level}.
After each user message, if there are grammar or spelling errors, add a brief
correction note formatted as: **Correction:** _original_ -> _corrected_: reason.
Keep responses conversational and under 80 words unless asked otherwise.
Current scenario: ${scenario?.label || "Free chat"}`;

    const history = messages.map((message) => `${message.role === "user" ? "User" : "Tutor"}: ${message.content}`).join("\n");
    const response = await appClient.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nConversation so far:\n${history}\nUser: ${input}\nTutor:`,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setSending(false);
  };

  if (!scenario) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <h1 className="font-syne text-2xl font-bold text-foreground">AI Tutor</h1>
        <p className="mt-1 text-sm text-muted-foreground">Practice real conversations with local tutor feedback.</p>

        <div className="mt-8 max-w-lg">
          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Choose a language</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {languages.map((item) => (
              <button key={item} onClick={() => setLanguage(item)} className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${language === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}>
                {item}
              </button>
            ))}
          </div>

          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Your level</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {levels.map((item) => (
              <button key={item} onClick={() => setLevel(item)} className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${level === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}>
                {item}
              </button>
            ))}
          </div>

          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Pick a scenario</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {scenarios.map((item) => (
              <button
                key={item.id}
                onClick={() => startConversation(item)}
                className="rounded-lg border border-[#2a2a2a] bg-transparent p-4 text-left transition-colors hover:border-[#333] hover:bg-[#141414]"
              >
                <item.icon className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-[16px] font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-10">
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Recent conversations</p>
            {recentConversations.map((conversation, index) => (
              <div key={index} className="flex min-h-[48px] items-center gap-3 border-b border-border py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                  <p className="text-[11px] text-muted-foreground">{conversation.meta}</p>
                </div>
                <button className="flex-shrink-0 text-[12px] text-primary">Resume</button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-syne text-lg font-bold text-foreground">
            {scenario.label} | {language}
          </h1>
          <p className="text-xs text-muted-foreground">{level} level</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setScenario(null); setMessages([]); }}>
          <Plus className="mr-1 h-4 w-4" /> New chat
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg border px-4 py-3 ${message.role === "user" ? "border-primary/20 bg-primary/10" : "border-border bg-card"}`}>
                <div className="prose prose-invert prose-sm max-w-none text-sm leading-body">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.role === "assistant" && (
                  <button onClick={() => speak(message.content.replace(/\*\*/g, "").replace(/\*/g, ""))} className="mt-2 text-muted-foreground transition-colors hover:text-primary">
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex gap-2">
          <button onClick={toggleListening} className={`rounded-md border p-2.5 transition-colors ${isListening ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Type in ${language}...`}
            className="flex-1 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
