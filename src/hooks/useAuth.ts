"use client";

import { useEffect, useState } from "react";

import { appClient } from "@/lib/app-client";
import type { AuthState, User, UserRole } from "@/types";

const defaultAuthState: AuthState = {
  user: null,
  loading: true,
  isAdmin: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isUserRole = (value: unknown): value is UserRole => value === "admin" || value === "user";

const toUser = (value: unknown): User | null => {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value;
  if (typeof candidate.id !== "string" || typeof candidate.email !== "string") {
    return null;
  }

  const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const role = isUserRole(candidate.role)
    ? candidate.role
    : envAdminEmail && candidate.email === envAdminEmail
      ? "admin"
      : "user";

  return {
    id: candidate.id,
    email: candidate.email,
    role,
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    full_name: typeof candidate.full_name === "string" ? candidate.full_name : undefined,
    passwordHash: typeof candidate.passwordHash === "string" ? candidate.passwordHash : undefined,
    bio: typeof candidate.bio === "string" ? candidate.bio : undefined,
    native_language: typeof candidate.native_language === "string" ? candidate.native_language : undefined,
    target_languages: typeof candidate.target_languages === "string" ? candidate.target_languages : undefined,
    streak_count: typeof candidate.streak_count === "number" ? candidate.streak_count : undefined,
    longest_streak: typeof candidate.longest_streak === "number" ? candidate.longest_streak : undefined,
    total_xp: typeof candidate.total_xp === "number" ? candidate.total_xp : undefined,
    current_level: typeof candidate.current_level === "number" ? candidate.current_level : undefined,
    daily_goal_minutes: typeof candidate.daily_goal_minutes === "number" ? candidate.daily_goal_minutes : undefined,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : undefined,
    created_date: typeof candidate.created_date === "string" ? candidate.created_date : undefined,
    updated_date: typeof candidate.updated_date === "string" ? candidate.updated_date : undefined,
  };
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    let mounted = true;

    appClient.auth
      .me()
      .then((value) => {
        if (!mounted) {
          return;
        }

        const user = toUser(value);
        setState({
          user,
          loading: false,
          isAdmin: user?.role === "admin",
        });
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setState({
          user: null,
          loading: false,
          isAdmin: false,
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
