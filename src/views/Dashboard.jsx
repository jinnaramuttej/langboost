import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Flame, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DailyGoalRing from "@/components/dashboard/DailyGoalRing";
import StatCard from "@/components/dashboard/StatCard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import StreakWidget from "@/components/shared/StreakWidget";
import { appClient } from "@/src/lib/app-client";

const languageBadge = (language) => {
  const map = {
    Spanish: "ES",
    French: "FR",
    Japanese: "JP",
    German: "DE",
    Italian: "IT",
  };
  return map[language] || "LG";
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    appClient.auth.me().then(setUser).catch(() => {});

    const hour = new Date().getHours();
    if (hour >= 17) setGreeting("Good evening");
    else if (hour >= 12) setGreeting("Good afternoon");
  }, []);

  const { data: progress = [] } = useQuery({
    queryKey: ["user-progress"],
    queryFn: () => appClient.entities.UserProgress.list("-updated_date", 10),
  });

  const { data: flashcards = [] } = useQuery({
    queryKey: ["flashcards-due"],
    queryFn: () => appClient.entities.Flashcard.list("-created_date", 20),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons-recent"],
    queryFn: () => appClient.entities.Lesson.list("-created_date", 10),
  });

  const inProgressLessons = progress.filter((item) => item.status === "in_progress");
  const completedCount = progress.filter((item) => item.status === "completed").length;
  const dueCards = flashcards.filter((card) => {
    if (!card.next_review_date) return true;
    return new Date(card.next_review_date) <= new Date();
  });

  const streakCount = user?.streak_count || 0;
  const totalXp = user?.total_xp || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-foreground">
            {greeting}, {user?.full_name?.split(" ")[0] || "there"}
          </h1>
          <div className="mt-1">
            <StreakWidget streak={streakCount} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Daily Streak" value={`Day ${streakCount}`} sub={`Best: ${user?.longest_streak || streakCount} days`} icon={Flame} />
        <StatCard title="Total XP" value={totalXp.toLocaleString()} sub="Keep learning" icon={Zap} />
        <StatCard title="Lessons Done" value={completedCount} sub={`${inProgressLessons.length} in progress`} icon={BookOpen} />
        <StatCard title="Cards Due" value={dueCards.length} sub={dueCards.length > 0 ? "Review now" : "All caught up"} icon={Layers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <DailyGoalRing minutesStudied={12} goal={user?.daily_goal_minutes || 15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Pick up where you left off</h3>
            <Link href="/lessons" className="text-xs text-primary hover:underline">
              Browse all
            </Link>
          </div>

          {lessons.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p>No lessons started yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/lessons">Browse lessons</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.slice(0, 3).map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="group flex items-center gap-4 rounded-md p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground">
                    {languageBadge(lesson.language)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lesson.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{lesson.difficulty_level}</span>
                      <span className="text-xs text-muted-foreground capitalize">{lesson.lesson_type}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                    Continue <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Cards due for review</h3>
          </div>

          {dueCards.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p>All caught up.</p>
              <p className="mt-1 text-xs">Check back later for reviews.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {dueCards.slice(0, 5).map((card) => (
                  <div key={card.id} className="rounded-md border border-border px-2.5 py-1 text-xs">
                    <span className="text-foreground">{card.front}</span>
                    {card.language && <span className="ml-1.5 text-muted-foreground">| {card.language}</span>}
                  </div>
                ))}
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href="/flashcards">Start review ({dueCards.length} cards)</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
