import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Eye, MessageSquare, Pin, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appClient } from "@/src/lib/app-client";

const categories = [
  { value: "all", label: "All" },
  { value: "grammar_help", label: "Grammar Help" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "culture", label: "Culture" },
  { value: "find_partners", label: "Find Partners" },
  { value: "off_topic", label: "Off-topic" },
];

const trendingThreads = [
  { rank: 1, title: "Tips for memorizing Spanish irregular verbs", replies: 24 },
  { rank: 2, title: "Best free resources for learning Japanese kanji", replies: 19 },
  { rank: 3, title: "How I reached B2 in French in 18 months", replies: 31 },
];

export default function Community() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", body: "", category: "grammar_help", language_tag: "" });
  const [user, setUser] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["forum-threads"],
    queryFn: () => appClient.entities.ForumThread.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.ForumThread.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      setShowNew(false);
      setNewThread({ title: "", body: "", category: "grammar_help", language_tag: "" });
    },
  });

  const filtered = threads.filter((thread) => {
    if (category !== "all" && thread.category !== category) return false;
    if (search && !thread.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryLabel = (value) => categories.find((item) => item.value === value)?.label || value;
  const initials = (name) => (name || "A")[0].toUpperCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="mb-5 flex items-center gap-0 border-b border-border pb-4">
        <span className="pr-4 text-[13px]" style={{ color: "#888" }}>2,841 members</span>
        <span className="mx-0 h-4 w-px bg-border" />
        <span className="px-4 text-[13px]" style={{ color: "#888" }}>143 threads</span>
        <span className="h-4 w-px bg-border" />
        <span className="pl-4 text-[13px]" style={{ color: "#888" }}>12 online now</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Community</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ask questions, share tips, and find study partners.</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New thread
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new thread</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <Input placeholder="Thread title" value={newThread.title} onChange={(event) => setNewThread({ ...newThread, title: event.target.value })} />
              <div className="flex gap-2">
                <Select value={newThread.category} onValueChange={(value) => setNewThread({ ...newThread, category: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((item) => item.value !== "all").map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Language tag" value={newThread.language_tag} onChange={(event) => setNewThread({ ...newThread, language_tag: event.target.value })} className="w-28" />
              </div>
              <Textarea placeholder="What is on your mind?" value={newThread.body} onChange={(event) => setNewThread({ ...newThread, body: event.target.value })} className="h-32" />
              <Button
                className="w-full"
                onClick={() => createMutation.mutate({ ...newThread, author_name: user?.full_name || "Anonymous" })}
                disabled={!newThread.title || !newThread.body}
              >
                Post thread
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.value}
            onClick={() => setCategory(item.value)}
            className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${category === item.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search threads..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 bg-card pl-9" />
      </div>

      <div className="mt-4 space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-border bg-card p-4" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-[15px] text-muted-foreground">No threads found.</p>
            <Button size="sm" className="mt-4" onClick={() => setShowNew(true)}>
              Start a thread
            </Button>
          </div>
        ) : (
          filtered.map((thread) => (
            <Link key={thread.id} href={`/community/${thread.id}`}>
              <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                <div className="flex items-start gap-3">
                  <div className="flex min-w-[40px] flex-col items-center gap-1">
                    <button className="text-muted-foreground hover:text-primary">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-medium text-foreground">{thread.upvotes || 0}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {thread.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      <h3 className="truncate text-sm font-medium text-foreground">{thread.title}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{thread.author_name || "Anonymous"}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{categoryLabel(thread.category)}</span>
                      {thread.language_tag && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{thread.language_tag}</span>}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {thread.reply_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {thread.view_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-medium text-muted-foreground">
                        {initials(thread.author_name)}
                      </div>
                      <span className="text-[11px]" style={{ color: "#555" }}>3h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Trending this week</p>
        {trendingThreads.map((thread) => (
          <div key={thread.rank} className="flex min-h-[44px] items-center gap-4 border-b border-border py-3 last:border-0">
            <span className="w-5 flex-shrink-0 text-right text-[13px] font-medium" style={{ color: "#444" }}>{thread.rank}</span>
            <p className="flex-1 truncate text-sm text-foreground">{thread.title}</p>
            <span className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {thread.replies}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
