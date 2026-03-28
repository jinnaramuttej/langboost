import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appClient } from "@/src/lib/app-client";

export default function Leaderboard() {
  const [tab, setTab] = useState("global");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => appClient.entities.User.list("-total_xp", 50),
  });

  const ranked = users.map((user, index) => ({ ...user, rank: index + 1 }));
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-32", "h-40", "h-28"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <h1 className="font-syne text-2xl font-bold text-foreground">Leaderboard</h1>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="alltime">All-time</TabsTrigger>
        </TabsList>
      </Tabs>

      {top3.length >= 3 && (
        <div className="mb-8 mt-8 flex items-end justify-center gap-3">
          {podiumOrder.map((user, index) => {
            const isFirst = index === 1;
            return (
              <div key={user.id} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center rounded-full text-sm font-bold ${
                    isFirst ? "h-14 w-14 bg-primary text-primary-foreground ring-2 ring-primary/30" : "h-12 w-12 border border-border bg-card"
                  }`}
                >
                  {(user.full_name || user.email || "U")[0].toUpperCase()}
                </div>
                <p className="mt-2 max-w-[80px] truncate text-xs font-medium text-foreground">
                  {user.full_name || user.email?.split("@")[0] || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground">{(user.total_xp || 0).toLocaleString()} XP</p>
                <div
                  className={`mt-2 flex w-20 items-end justify-center rounded-t-md border pb-2 ${podiumHeights[index]} ${
                    isFirst ? "border-primary/20 bg-primary/10" : "border-border bg-muted"
                  }`}
                >
                  <span className={`font-syne text-lg font-bold ${isFirst ? "text-primary" : "text-muted-foreground"}`}>
                    #{[2, 1, 3][index]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Streak</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">XP</th>
            </tr>
          </thead>
          <tbody>
            {(rest.length > 0 ? rest : ranked).map((user) => {
              const isMe = currentUser && user.email === currentUser.email;
              return (
                <tr key={user.id} className={`border-b border-border last:border-0 ${isMe ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                  <td className="px-4 py-3 text-sm text-muted-foreground">#{user.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-xs font-medium">
                        {(user.full_name || user.email || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.full_name || user.email?.split("@")[0] || "User"}</p>
                        {isMe && <span className="text-[10px] text-primary">You</span>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Flame className="h-3.5 w-3.5" />
                      {user.streak_count || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-foreground">{(user.total_xp || 0).toLocaleString()}</span>
                    <span className="ml-1 text-xs text-muted-foreground">XP</span>
                  </td>
                </tr>
              );
            })}
            {ranked.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  No learners yet. Be the first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
