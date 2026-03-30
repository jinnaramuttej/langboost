import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { appClient } from "@/src/lib/app-client";
import { speakText } from "@/src/lib/speech";

const reviewConfig = {
  again: { interval: 1, easeDelta: -0.2, label: "Again" },
  good: { interval: 3, easeDelta: 0, label: "Good" },
  easy: { interval: 6, easeDelta: 0.15, label: "Easy" },
};

const nextReviewDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export default function Flashcards() {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: () => appClient.entities.Flashcard.list("-created_date", 50),
  });

  const dueCards = useMemo(
    () => cards.filter((card) => !card.next_review_date || new Date(card.next_review_date) <= new Date()),
    [cards]
  );

  const currentCard = dueCards[index] || null;

  const reviewMutation = useMutation({
    mutationFn: async ({ card, outcome }) => {
      const config = reviewConfig[outcome];
      const nextInterval = Math.max(1, Math.round((card.interval_days || 1) * config.interval));
      const nextEase = Math.max(1.3, Number((card.ease_factor || 2.5) + config.easeDelta).toFixed(2));

      return appClient.entities.Flashcard.update(card.id, {
        interval_days: nextInterval,
        ease_factor: Number(nextEase),
        repetitions: (card.repetitions || 0) + 1,
        next_review_date: nextReviewDate(nextInterval),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      setShowAnswer(false);
      setIndex((current) => current + 1);
    },
  });

  const speak = (text, language) => {
    void speakText(text, language || "English");
  };

  const resetQueue = () => {
    setIndex(0);
    setShowAnswer(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-foreground">Flashcards</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dueCards.length} cards ready for review</p>
        </div>
        <Button variant="outline" onClick={resetQueue}>
          <RotateCcw className="mr-2 h-4 w-4" /> Restart queue
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="rounded-xl border border-border bg-card p-6">
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">Loading flashcards...</div>
          ) : !currentCard ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-foreground">No cards due right now.</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                You have finished the current review queue. Come back later or restart to inspect the deck again.
              </p>
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>{currentCard.language || "General"}</span>
                <span>
                  Card {Math.min(index + 1, dueCards.length)} of {dueCards.length}
                </span>
              </div>

              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-border/80 bg-background px-6 py-10 text-center">
                <button
                  type="button"
                  className="mb-4 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => speak(currentCard.front, currentCard.language)}
                  aria-label="Play flashcard pronunciation"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <p className="font-syne text-4xl text-foreground">{currentCard.front}</p>
                {showAnswer ? (
                  <>
                    <p className="mt-6 text-lg text-primary">{currentCard.back}</p>
                    {currentCard.example_sentence && (
                      <p className="mt-3 max-w-md text-sm leading-body text-muted-foreground">{currentCard.example_sentence}</p>
                    )}
                  </>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">Reveal the answer when you are ready.</p>
                )}
              </div>

              <div className="mt-6">
                {!showAnswer ? (
                  <Button className="w-full" onClick={() => setShowAnswer(true)}>
                    Show answer
                  </Button>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Object.entries(reviewConfig).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={key === "again" ? "outline" : "default"}
                        onClick={() => reviewMutation.mutate({ card: currentCard, outcome: key })}
                        disabled={reviewMutation.isPending}
                      >
                        {value.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">Review status</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Due now</p>
                <p className="mt-2 font-syne text-3xl text-foreground">{dueCards.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total cards</p>
                <p className="mt-2 font-syne text-3xl text-foreground">{cards.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">Up next</h2>
            <div className="mt-4 space-y-2">
              {dueCards.slice(index + 1, index + 5).map((card) => (
                <div key={card.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.front}</p>
                    <p className="text-xs text-muted-foreground">{card.language || "General"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{card.deck_name || "Deck"}</span>
                </div>
              ))}
              {dueCards.slice(index + 1, index + 5).length === 0 && (
                <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  No more cards in the active queue.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">How it works</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <p>
                  Use <span className="text-foreground">Good</span> when the answer came quickly.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <X className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p>
                  Use <span className="text-foreground">Again</span> to bring the card back soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
