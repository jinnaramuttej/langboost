import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appClient } from "@/src/lib/app-client";

export default function CommunityThread({ threadId: routeThreadId }) {
  const threadId = routeThreadId || (typeof window !== "undefined" ? window.location.pathname.split("/community/")[1] : null);
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: threads = [] } = useQuery({
    queryKey: ["forum-threads"],
    queryFn: () => appClient.entities.ForumThread.list("-created_date", 50),
  });

  const thread = threads.find((item) => item.id === threadId);

  const { data: replies = [] } = useQuery({
    queryKey: ["forum-replies", threadId],
    queryFn: () => appClient.entities.ForumReply.filter({ thread_id: threadId }, "-created_date", 50),
    enabled: !!threadId,
  });

  const replyMutation = useMutation({
    mutationFn: (data) => appClient.entities.ForumReply.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forum-replies", threadId] });
      if (thread) {
        await appClient.entities.ForumThread.update(thread.id, { reply_count: (thread.reply_count || 0) + 1 });
        await queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      }
      setReplyText("");
    },
  });

  if (!thread) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Thread not found.</p>
        <Button asChild variant="ghost" className="mt-3">
          <Link href="/community">Back to community</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Link href="/community" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to community
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-2 flex items-center gap-2">
          {thread.language_tag && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{thread.language_tag}</span>}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{thread.category?.replace("_", " ")}</span>
        </div>
        <h1 className="font-syne text-xl font-bold text-foreground">{thread.title}</h1>
        <div className="mt-1 text-xs text-muted-foreground">
          by {thread.author_name || "Anonymous"} | {new Date(thread.created_date).toLocaleDateString()}
        </div>
        <div className="prose prose-invert prose-sm mt-4 max-w-none text-sm leading-body text-foreground">
          <ReactMarkdown>{thread.body}</ReactMarkdown>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowUp className="h-4 w-4" /> {thread.upvotes || 0}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h3>
        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {reply.author_name || "Anonymous"} | {new Date(reply.created_date).toLocaleDateString()}
                </span>
                {reply.is_accepted && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">Accepted</span>}
              </div>
              <div className="prose prose-invert prose-sm mt-2 max-w-none text-sm leading-body text-foreground">
                <ReactMarkdown>{reply.body}</ReactMarkdown>
              </div>
              <button className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <ArrowUp className="h-3 w-3" /> {reply.upvotes || 0}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-medium text-foreground">Write a reply</h3>
        <Textarea placeholder="Share your thoughts..." value={replyText} onChange={(event) => setReplyText(event.target.value)} className="h-24" />
        <Button
          className="mt-3"
          onClick={() => replyMutation.mutate({ thread_id: threadId, body: replyText, author_name: user?.full_name || "Anonymous" })}
          disabled={!replyText.trim()}
        >
          Post reply
        </Button>
      </div>
    </motion.div>
  );
}
