"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.push("/dashboard");
    }
  }, [adminOnly, isAdmin, loading, redirectTo, router, user]);

  if (loading || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
