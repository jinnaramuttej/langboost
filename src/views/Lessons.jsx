import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Grid3X3, List, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appClient } from "@/src/lib/app-client";

const difficultyLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const lessonTypes = ["vocabulary", "grammar", "listening", "reading", "speaking"];
const languages = ["Spanish", "French", "German", "Japanese", "Italian", "Portuguese", "Korean", "Chinese"];

const difficultyColors = {
  A1: "bg-green-500/20 text-green-400 border-green-500/30",
  A2: "bg-green-500/20 text-green-400 border-green-500/30",
  B1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  B2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  C1: "bg-red-500/20 text-red-400 border-red-500/30",
  C2: "bg-red-500/20 text-red-400 border-red-500/30",
};

function mockProgress(lessonId) {
  const seed = lessonId?.charCodeAt(0) || 0;
  const statuses = ["not_started", "not_started", "in_progress", "completed"];
  const status = statuses[seed % statuses.length];
  const pct = status === "completed" ? 100 : status === "in_progress" ? (seed % 60) + 20 : 0;
  return { status, pct };
}

function StatusDot({ status }) {
  const colors = { not_started: "#555", in_progress: "#F59E0B", completed: "#22c55e" };
  return <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: colors[status] || "#555" }} />;
}

function LessonCardGrid({ lesson }) {
  const { status, pct } = mockProgress(lesson.id);

  return (
    <Link href={`/lessons/${lesson.id}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-150 hover:border-foreground/20">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{lesson.language}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] ${difficultyColors[lesson.difficulty_level] || ""}`}>
                {lesson.difficulty_level}
              </Badge>
              <StatusDot status={status} />
            </div>
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{lesson.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lesson.description}</p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{lesson.lesson_type}</span>
              <span className="text-xs text-muted-foreground">{lesson.duration_minutes || 10} min</span>
            </div>
            <span className="text-xs text-primary">+{lesson.xp_reward || 50} XP</span>
          </div>
        </div>
        <div className="h-[4px] w-full bg-[#222]">
          {pct > 0 && <div className="h-full bg-primary" style={{ width: `${pct}%` }} />}
        </div>
      </div>
    </Link>
  );
}

export default function Lessons() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => appClient.entities.Lesson.list("-created_date", 50),
  });

  const filtered = lessons.filter((lesson) => {
    if (search && !lesson.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedDifficulty && lesson.difficulty_level !== selectedDifficulty) return false;
    if (selectedType && lesson.lesson_type !== selectedType) return false;
    if (selectedLanguage && lesson.language !== selectedLanguage) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <h1 className="font-syne text-2xl font-bold text-foreground">Lesson Library</h1>
      <p className="mt-1 text-sm text-muted-foreground">{filtered.length} lessons available</p>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search lessons..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 border-border bg-card pl-9" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs text-muted-foreground">Level:</span>
          {difficultyLevels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${selectedDifficulty === level ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs text-muted-foreground">Type:</span>
          {lessonTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${selectedType === type ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs text-muted-foreground">Language:</span>
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => setSelectedLanguage(selectedLanguage === language ? null : language)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${selectedLanguage === language ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
            >
              {language}
            </button>
          ))}
          {(selectedDifficulty || selectedType || selectedLanguage) && (
            <button
              onClick={() => {
                setSelectedDifficulty(null);
                setSelectedType(null);
                setSelectedLanguage(null);
              }}
              className="ml-2 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`rounded p-1.5 ${view === "grid" ? "bg-muted" : ""}`}>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setView("list")} className={`rounded p-1.5 ${view === "list" ? "bg-muted" : ""}`}>
            <List className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-lg border border-border bg-card p-4">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-[15px] text-muted-foreground">No lessons found.</p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => {
              setSelectedDifficulty(null);
              setSelectedType(null);
              setSelectedLanguage(null);
              setSearch("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lesson) => (
            <LessonCardGrid key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((lesson) => {
            const { status, pct } = mockProgress(lesson.id);

            return (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="overflow-hidden rounded-lg border border-border bg-card transition-colors duration-150 hover:border-foreground/20">
                  <div className="flex items-center gap-4 p-3">
                    <StatusDot status={status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-foreground">{lesson.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${difficultyColors[lesson.difficulty_level] || ""}`}>
                          {lesson.difficulty_level}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {lesson.language} | {lesson.lesson_type} | {lesson.duration_minutes || 10} min
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-primary">+{lesson.xp_reward || 50} XP</span>
                  </div>
                  <div className="h-[4px] w-full bg-[#222]">
                    {pct > 0 && <div className="h-full bg-primary" style={{ width: `${pct}%` }} />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
