"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  Brain,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/lessons", label: "My Lessons", icon: BookOpen },
  { path: "/flashcards", label: "Flashcards", icon: Layers },
  { path: "/quizzes", label: "Quizzes", icon: Brain },
  { path: "/ai-tutor", label: "AI Tutor", icon: MessageSquare },
  { path: "/vocabulary", label: "Vocabulary", icon: BookMarked },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/community", label: "Community", icon: Users },
];

const bottomItems = [{ path: "/settings", label: "Settings", icon: Settings }];

const XP_CURRENT = 1240;
const XP_NEXT = 2000;
const XP_LEVEL = 5;
const XP_PCT = Math.round((XP_CURRENT / XP_NEXT) * 100);

export default function Sidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => pathname.startsWith(path);
  const initials = (user?.full_name || user?.email || "U")[0].toUpperCase();
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const streak = user?.streak_count || 7;
  const level = user?.current_level || 4;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col border-r border-sidebar-border bg-sidebar
          transition-transform duration-250 ease-out lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/dashboard" className="font-syne text-lg font-bold tracking-display text-foreground">
            LanguageBoost
          </Link>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-foreground"
            style={{ background: "#1A1A1A", borderColor: "#333" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium" style={{ color: "#F5F5F5" }}>
              {displayName}
            </p>
            <p className="text-[11px]" style={{ color: "#888" }}>
              Streak {streak} days | Lv. {level}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150
                  ${
                    active
                      ? "border-sidebar-primary bg-sidebar-accent text-sidebar-primary"
                      : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="mb-1.5 text-[11px]" style={{ color: "#888" }}>
            {XP_CURRENT.toLocaleString()} / {XP_NEXT.toLocaleString()} XP to Level {XP_LEVEL}
          </p>
          <div className="h-[4px] w-full rounded-full bg-[#222]">
            <div className="h-full rounded-full bg-primary" style={{ width: `${XP_PCT}%` }} />
          </div>
        </div>

        <div className="space-y-0.5 border-t border-sidebar-border px-3 py-3">
          {bottomItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150
                  ${
                    active
                      ? "border-sidebar-primary bg-sidebar-accent text-sidebar-primary"
                      : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
