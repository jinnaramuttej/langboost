import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Gauge,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { appClient } from "@/src/lib/app-client";

const languages = ["Spanish", "French", "German", "Japanese", "Italian"];
const difficulties = ["A1", "A2", "B1", "B2"];

const recentResults = [
  { name: "Spanish Vocabulary", label: "Spanish", score: 8, total: 10, date: "2 days ago", xp: 40 },
  { name: "French Grammar", label: "French", score: 5, total: 10, date: "4 days ago", xp: 25 },
  { name: "Japanese Basics", label: "Japanese", score: 3, total: 10, date: "6 days ago", xp: 15 },
];

const quizTips = [
  "Each quiz generates 5 multiple-choice vocabulary questions.",
  "Explanations appear after every answer so you can learn while moving.",
  "Use A1 and A2 for speed drills, then step up once accuracy stays high.",
];

function ScorePill({ score, total }) {
  const pct = score / total;
  const color =
    pct >= 0.7
      ? "border-green-500/40 text-green-400"
      : pct >= 0.5
        ? "border-amber-500/40 text-amber-400"
        : "border-red-500/40 text-red-400";

  return <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${color}`}>{score}/{total}</span>;
}

export default function Quizzes() {
  const [language, setLanguage] = useState("Spanish");
  const [difficulty, setDifficulty] = useState("A1");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setFinished(false);
    setError("");
  };

  const generateQuiz = async () => {
    setGenerating(true);
    setError("");

    try {
      const result = await appClient.integrations.Core.InvokeLLM({
        prompt: `Generate a ${difficulty} level ${language} vocabulary quiz with 5 multiple-choice questions. Each question should test word knowledge with 4 options.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_index: { type: "number" },
                  explanation: { type: "string" },
                },
              },
            },
          },
        },
      });

      setQuestions(result.questions || []);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setAnswered(false);
      setFinished(false);
    } catch (invokeError) {
      const message = invokeError instanceof Error ? invokeError.message : "Quiz generation failed.";
      resetQuiz();
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === questions[currentQ]?.correct_index) {
      setScore((current) => current + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentQ((value) => value + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-h-[60vh] items-center justify-center rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
          <div className="max-w-md text-center">
            <div className="font-syne text-5xl font-bold text-foreground">{pct}%</div>
            <p className="mt-2 text-muted-foreground">
              {score} of {questions.length} correct
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {pct >= 80 ? "Strong recall. Increase the level or switch languages." : "Review the explanations and run another set while the mistakes are still fresh."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={resetQuiz}>
                <RotateCcw className="mr-1 h-4 w-4" /> New quiz
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
          <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Result summary</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Language</p>
                <p className="mt-1 text-sm font-medium text-foreground">{language}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Difficulty</p>
                <p className="mt-1 text-sm font-medium text-foreground">{difficulty}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Accuracy</p>
                <p className="mt-1 text-sm font-medium text-foreground">{pct}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Keep streaks moving</p>
            <div className="mt-4 space-y-3">
              {quizTips.map((tip) => (
                <div key={tip} className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </motion.div>
    );
  }

  if (questions.length > 0) {
    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
          <div className="mb-6 h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-foreground">{score} correct</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="max-w-4xl">
                <h2 className="mb-6 font-syne text-2xl font-semibold text-foreground">{question?.prompt}</h2>
                <div className="space-y-3">
                  {question?.options?.map((option, index) => {
                    let style = "border-border hover:border-foreground/20";
                    if (answered) {
                      if (index === question.correct_index) {
                        style = "border-green-500/50 bg-green-500/10";
                      } else if (index === selected) {
                        style = "border-red-500/50 bg-red-500/10";
                      }
                    } else if (index === selected) {
                      style = "border-primary bg-primary/10";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-sm text-foreground">{option}</span>
                          {answered && index === question.correct_index && <Check className="ml-auto h-4 w-4 text-green-500" />}
                          {answered && index === selected && index !== question.correct_index && <X className="ml-auto h-4 w-4 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {answered && question?.explanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-border bg-background/80 p-4">
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </motion.div>
                )}

                {answered && (
                  <Button className="mt-6" onClick={nextQuestion}>
                    {currentQ + 1 >= questions.length ? "See results" : "Next"} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
          <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Current quiz</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Language</p>
                <p className="mt-1 text-sm font-medium text-foreground">{language}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Difficulty</p>
                <p className="mt-1 text-sm font-medium text-foreground">{difficulty}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Progress</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentQ + 1}/{questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">How to use it</p>
            <div className="mt-4 space-y-3">
              {quizTips.map((tip) => (
                <div key={tip} className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Quizzes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Test your knowledge with locally generated quizzes.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Language</p>
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
                <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((item) => (
                    <button
                      key={item}
                      onClick={() => setDifficulty(item)}
                      className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                        difficulty === item
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
                  <Gauge className="h-4 w-4 text-primary" />
                  Quiz setup
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  This run uses <span className="font-medium text-foreground">{language}</span> vocabulary at the{" "}
                  <span className="font-medium text-foreground">{difficulty}</span> level.
                </p>
              </div>

              <Button onClick={generateQuiz} disabled={generating} className="w-full">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating quiz...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" /> Start quiz
                  </>
                )}
              </Button>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-medium text-foreground">Adaptive prompts</p>
                <p className="mt-2 text-sm text-muted-foreground">Fresh question sets with explanations after each answer.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <BarChart3 className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-medium text-foreground">Instant scoring</p>
                <p className="mt-2 text-sm text-muted-foreground">Track accuracy as you go instead of waiting for the end.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <Trophy className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-medium text-foreground">Short practice loops</p>
                <p className="mt-2 text-sm text-muted-foreground">Five questions keeps the session fast enough to repeat.</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your recent results</p>
            <div className="mt-4 space-y-3">
              {recentResults.map((result) => (
                <div key={result.name} className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {result.label} | {result.date}
                      </p>
                    </div>
                    <ScorePill score={result.score} total={result.total} />
                  </div>
                  <p className="mt-3 text-right text-[11px] font-medium text-primary">+{result.xp} XP</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card/70 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Quick stats</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { value: "12", label: "Quizzes taken" },
                { value: "74%", label: "Avg. score" },
                { value: "360", label: "XP from quizzes" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-background/70 px-4 py-4 text-center">
                  <p className="font-syne text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
