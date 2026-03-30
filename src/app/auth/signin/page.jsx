"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appClient } from "@/lib/app-client";
import { useAuth } from "@/hooks/useAuth";

const initialForm = {
  email: "",
  password: "",
};

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const signedInUser = await appClient.auth.signIn({
      email: form.email,
      password: form.password,
    });

    if (!signedInUser) {
      toast.error("Invalid email or password");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10">
      <div className="absolute -left-28 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full items-stretch overflow-hidden rounded-[28px] border border-white/10 bg-card/65 shadow-[0_28px_100px_rgba(0,0,0,0.35)] backdrop-blur-md lg:grid-cols-[0.92fr_1.08fr]">
          <div className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,241,159,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_50%)] p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="font-syne text-2xl font-bold tracking-display text-foreground">
                LanguageBoost
              </Link>
              <p className="mt-6 max-w-sm font-syne text-4xl font-bold leading-tight text-foreground">
                Sign in and keep your language streak moving.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-body text-muted-foreground">
                Lessons, flashcards, quizzes, and AI practice all pick up where your last session left off.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Demo credentials</p>
              <p className="mt-3 text-sm text-foreground">Email: alex@languageboost.app</p>
              <p className="mt-1 text-sm text-foreground">Password: demo1234</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <Link href="/" className="font-syne text-2xl font-bold tracking-display text-foreground lg:hidden">
                LanguageBoost
              </Link>
              <h1 className="mt-6 font-syne text-3xl font-bold text-foreground">Sign in</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Use your LangBoost account to continue learning.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="alex@languageboost.app"
                    className="h-11 bg-background/70"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="Enter your password"
                    className="h-11 bg-background/70"
                    required
                  />
                </div>

                <Button type="submit" className="h-11 w-full text-sm" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                Need a fresh start?{" "}
                <Link href="/" className="text-primary hover:underline">
                  Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
