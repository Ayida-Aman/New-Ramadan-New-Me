"use client";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRamadanInfo } from "@/lib/ramadan";
import { CheckCircle2, Circle, Sparkles, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyChallenge, UserChallengeCompletion } from "@/types/supabase";

export default function ChallengesPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const ramadan = getRamadanInfo();

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_challenges")
        .select("*")
        .order("day_number");
      return (data ?? []) as DailyChallenge[];
    },
  });

  const { data: completions } = useQuery({
    queryKey: ["challenge-completions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_challenge_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("ramadan_year", ramadan.year);
      return (data ?? []) as UserChallengeCompletion[];
    },
    enabled: !!user,
  });

  const completeChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Not auth");
      const { error } = await supabase.from("user_challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        ramadan_year: ramadan.year,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-completions"] });
    },
  });

  const completedIds = new Set(completions?.map((c) => c.challenge_id) ?? []);
  const currentDay = ramadan.currentDay ?? 1;
  const totalCompleted = completedIds.size;

  // Group by week
  const weeks = [
    { num: 1, title: "Discipline & Renewal", days: [1, 7] },
    { num: 2, title: "Spiritual Depth", days: [8, 14] },
    { num: 3, title: "Community & Service", days: [15, 21] },
    { num: 4, title: "Gratitude & Growth", days: [22, 30] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          Daily Challenges
        </h1>
        <p className="text-muted mt-1">
          {totalCompleted}/30 completed
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-gold" />
            Progress
          </span>
          <span className="text-sm font-bold text-navy dark:text-gold">
            {Math.round((totalCompleted / 30) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-700"
            style={{ width: `${(totalCompleted / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Challenges by week */}
      {weeks.map((week) => {
        const weekChallenges =
          challenges?.filter(
            (c) => c.day_number >= week.days[0] && c.day_number <= week.days[1]
          ) ?? [];

        return (
          <div key={week.num}>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Week {week.num}: {week.title}
            </h2>
            <div className="space-y-2">
              {weekChallenges.map((challenge) => {
                const isCompleted = completedIds.has(challenge.id);
                const isToday = challenge.day_number === currentDay;
                const isFuture = challenge.day_number > currentDay;

                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      "bg-card rounded-xl border p-4 transition-all",
                      isToday
                        ? "border-gold/50 shadow-sm shadow-gold/10"
                        : "border-border/50",
                      isFuture && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          if (!isCompleted && !isFuture) {
                            completeChallenge.mutate(challenge.id);
                          }
                        }}
                        disabled={isCompleted || isFuture || completeChallenge.isPending}
                        className="mt-0.5 shrink-0"
                      >
                        {completeChallenge.isPending &&
                        completeChallenge.variables === challenge.id ? (
                          <Loader2 className="h-5 w-5 text-gold animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald" />
                        ) : (
                          <Circle
                            className={cn(
                              "h-5 w-5",
                              isToday ? "text-gold" : "text-border"
                            )}
                          />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">
                            Day {challenge.day_number}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold bg-gold/10 text-gold px-1.5 py-0.5 rounded-md">
                              TODAY
                            </span>
                          )}
                          <span className="text-[10px] text-muted bg-secondary px-1.5 py-0.5 rounded-md">
                            {challenge.points}pts
                          </span>
                        </div>
                        <h3
                          className={cn(
                            "font-semibold mt-0.5",
                            isCompleted
                              ? "text-emerald line-through"
                              : "text-navy dark:text-cream-light"
                          )}
                        >
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted mt-0.5">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
