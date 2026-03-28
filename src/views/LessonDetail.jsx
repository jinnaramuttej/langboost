import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, Volume2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appClient } from "@/src/lib/app-client";
import { speakText } from "@/src/lib/speech";

export default function LessonDetail({ lessonId: routeLessonId }) {
  const lessonId = routeLessonId || (typeof window !== "undefined" ? window.location.pathname.split("/lessons/")[1] : null);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const lessons = await appClient.entities.Lesson.list("-created_date", 50);
      return lessons.find((item) => item.id === lessonId) || null;
    },
    enabled: !!lessonId,
  });

  const speak = (text) => {
    void speakText(text, lesson?.language || "English");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-8 w-96 rounded bg-muted" />
        <div className="h-64 rounded bg-muted" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button asChild variant="ghost" className="mt-3">
          <Link href="/lessons">Back to lessons</Link>
        </Button>
      </div>
    );
  }

  let content = [];
  try {
    content = JSON.parse(lesson.content || "[]");
  } catch {
    content = [];
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Link href="/lessons" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to lessons
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{lesson.language}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <Badge variant="outline" className="text-[10px]">
              {lesson.difficulty_level}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {lesson.lesson_type}
            </Badge>
          </div>
          <h1 className="font-syne text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>

          <Tabs defaultValue="content" className="mt-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              {content.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {content.map((item, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-foreground">{item.word || item.term || item.front}</p>
                        <button onClick={() => speak(item.word || item.term || item.front)} className="text-muted-foreground transition-colors hover:text-primary">
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.phonetic && <p className="mt-0.5 text-xs text-muted-foreground">{item.phonetic}</p>}
                      <p className="mt-2 text-sm text-muted-foreground">{item.definition || item.back || item.meaning}</p>
                      {item.example && <p className="mt-1 text-xs italic text-muted-foreground">"{item.example}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card py-12 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Lesson content will appear here when content is available.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="practice" className="mt-4">
              <div className="rounded-lg border border-border bg-card py-12 text-center">
                <p className="text-sm text-muted-foreground">Practice exercises for this lesson are coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Lesson info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{lesson.duration_minutes || 10} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+{lesson.xp_reward || 50} XP reward</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize text-muted-foreground">{lesson.lesson_type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
