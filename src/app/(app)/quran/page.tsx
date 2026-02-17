/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import {
  BookOpen,
  Flame,
  Check,
  Loader2,
  Calendar,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRamadanInfo,
  calculateDailyTarget,
  distributePagesAcrossPrayers,
  PRAYERS,
  PRAYER_LABELS,
  type Prayer,
} from "@/lib/ramadan";
import type { QuranGoal, ReadingLog, ReadingStats } from "@/types/supabase";

const QURAN_PAGES = 604;

export default function QuranPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const ramadan = getRamadanInfo();

  // Fetch goal
  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["quran-goal", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("quran_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch all reading logs
  const { data: logs } = useQuery({
    queryKey: ["reading-logs", user?.id, goal?.id],
    queryFn: async () => {
      if (!user || !goal) return [];
      const { data } = await supabase
        .from("reading_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_id", goal.id)
        .order("log_date", { ascending: false });
      return (data ?? []) as ReadingLog[];
    },
    enabled: !!user && !!goal,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["reading-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.rpc("get_user_reading_stats", {
        p_user_id: user.id,
        p_year: ramadan.year,
      });
      return data?.[0] ?? null;
    },
    enabled: !!user,
  });

  const stats = statsData as ReadingStats | null;

  const [khatmCount, setKhatmCount] = useState(1);

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (times: number) => {
      if (!user) throw new Error("Not authenticated");
      const totalPages = QURAN_PAGES * times;
      const goalType = times <= 3 ? (`${times}x` as "1x" | "2x" | "3x") : "custom";
      const daily = calculateDailyTarget(totalPages, ramadan.totalDays);
      const distribution = distributePagesAcrossPrayers(daily);

      const { data, error } = await supabase
        .from("quran_goals")
        .insert({
          user_id: user.id,
          goal_type: goalType,
          total_pages: totalPages,
          ramadan_days: ramadan.totalDays,
          prayer_distribution: distribution,
          ramadan_year: ramadan.year,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-goal"] });
    },
  });

  // Log reading mutation
  const logReading = useMutation({
    mutationFn: async ({
      pages,
      prayers,
    }: {
      pages: number;
      prayers: Record<Prayer, boolean>;
    }) => {
      if (!user || !goal) throw new Error("No goal");
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("reading_logs").upsert(
        {
          user_id: user.id,
          goal_id: goal.id,
          log_date: today,
          pages_read: pages,
          prayers_completed: prayers,
        },
        { onConflict: "user_id,goal_id,log_date" }
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      if (!user) return;
      queryClient.invalidateQueries({ queryKey: ["reading-logs"] });
      queryClient.invalidateQueries({ queryKey: ["reading-stats"] });

      try {
        // Fetch relevant badges (quran + streak categories)
        const { data: badges } = await supabase
          .from("badges")
          .select("*")
          .in("category", ["quran", "streak"]);

        if (!badges || badges.length === 0) return;

        // Fetch already earned badges
        const { data: userBadges } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id);

        const earned = new Set((userBadges ?? []).map((b: any) => b.badge_id));

        // Get latest reading stats via RPC
        const { data: statsArr } = await supabase.rpc("get_user_reading_stats", {
          p_user_id: user.id,
          p_year: ramadan.year,
        });
        const stats = (statsArr && statsArr[0]) || { total_pages_read: 0, current_streak: 0 };

        for (const badge of badges) {
          if (earned.has(badge.id)) continue;

          // badge.requirement is stored as JSON in the DB
          const req: any = badge.requirement ?? {};

          let qualifies = false;

          if (req.pages_read && typeof req.pages_read === "number") {
            if (stats.total_pages_read >= req.pages_read) qualifies = true;
          }
          if (req.streak && typeof req.streak === "number") {
            if (stats.current_streak >= req.streak) qualifies = true;
          }

          if (qualifies) {
            // award badge
            await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id });

            // create notification
            await supabase.from("notifications").insert({
              user_id: user.id,
              type: "badge_earned",
              title: `Badge earned: ${badge.title}`,
              body: `You earned the \"${badge.title}\" badge.`,
              data: { badge_id: badge.id },
            });
          }
        }

        queryClient.invalidateQueries({ queryKey: ["user-badges", user.id] });
        queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
      } catch (err) {
        // don't block the main flow if awarding fails
        // console.warn(err);
      }
    },
  });

  const [todayPages, setTodayPages] = useState(0);
  const [prayersDone, setPrayersDone] = useState<Record<Prayer, boolean>>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });

  // Init from today's log
  const todayLog = logs?.find(
    (l) => l.log_date === new Date().toISOString().split("T")[0]
  );
  useEffect(() => {
    if (todayLog) {
      setTodayPages((prev) =>
        prev !== todayLog.pages_read ? todayLog.pages_read : prev
      );
      if (
        todayLog.prayers_completed &&
        JSON.stringify(todayLog.prayers_completed) !== JSON.stringify(prayersDone)
      ) {
        setPrayersDone(todayLog.prayers_completed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayLog]);

  if (goalLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  // Goal setup view
  if (!goal) {
    const totalPages = QURAN_PAGES * khatmCount;
    const dailyTarget = calculateDailyTarget(totalPages, ramadan.totalDays);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
            Quran Reading Planner
          </h1>
          <p className="text-muted mt-1">
            How many times would you like to finish the Quran?
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col items-center">
          <BookOpen className="h-10 w-10 text-gold mb-4" />

          <div className="flex items-center gap-5 mb-4">
            <button
              onClick={() => setKhatmCount(Math.max(1, khatmCount - 1))}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="text-center">
              <span className="text-4xl font-bold text-navy dark:text-gold">
                {khatmCount}
              </span>
              <p className="text-sm text-muted mt-1">
                {khatmCount === 1 ? "time" : "times"}
              </p>
            </div>
            <button
              onClick={() => setKhatmCount(khatmCount + 1)}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full bg-gold/5 rounded-xl p-3 mb-5 text-center">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{totalPages}</span> pages total &middot;{" "}
              <span className="font-semibold">~{dailyTarget}</span> pages/day
            </p>
          </div>

          <button
            onClick={() => createGoal.mutate(khatmCount)}
            disabled={createGoal.isPending}
            className="w-full bg-navy dark:bg-gold text-cream-light dark:text-navy py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createGoal.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Start Tracking"
            )}
          </button>
        </div>
      </div>
    );
  }

  // Main tracking view
  const totalRead = stats?.total_pages_read ?? 0;
  const progress = goal.total_pages > 0 ? Math.round((totalRead / goal.total_pages) * 100) : 0;
  const streak = stats?.current_streak ?? 0;
  const distribution = goal.prayer_distribution as Record<Prayer, number>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          Quran Progress
        </h1>
        <p className="text-muted mt-1">
          {goal.goal_type.toUpperCase()} Khatm &middot; {goal.daily_target} pages/day
        </p>
      </div>

      {/* Large progress ring */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col items-center">
        <ProgressRing progress={progress} size={180} strokeWidth={14}>
          <span className="text-3xl font-bold text-navy dark:text-gold">
            {progress}%
          </span>
          <span className="text-sm text-muted">
            {totalRead}/{goal.total_pages}
          </span>
        </ProgressRing>

        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-navy dark:text-gold">
              {stats?.days_logged ?? 0}
            </div>
            <div className="text-xs text-muted">Days</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold text-navy dark:text-gold flex items-center gap-1">
              <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-500" : "text-muted")} />
              {streak}
            </div>
            <div className="text-xs text-muted">Streak</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold text-navy dark:text-gold">
              {goal.total_pages - totalRead}
            </div>
            <div className="text-xs text-muted">Remaining</div>
          </div>
        </div>
      </div>

      {/* Today's log */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gold" />
          Today&apos;s Reading
        </h2>

        {/* Pages input */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-muted">Pages read:</label>
          <input
            type="number"
            min={0}
            max={604}
            value={todayPages}
            onChange={(e) => setTodayPages(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 rounded-xl border border-input bg-background text-center font-semibold text-navy dark:text-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <span className="text-sm text-muted">/ {goal.daily_target}</span>
        </div>

        {/* Prayer checkboxes */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted">Prayers with Quran reading:</p>
          <div className="flex flex-wrap gap-2">
            {PRAYERS.map((prayer) => (
              <button
                key={prayer}
                onClick={() =>
                  setPrayersDone((prev) => ({
                    ...prev,
                    [prayer]: !prev[prayer],
                  }))
                }
                className={cn(
                  "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  prayersDone[prayer]
                    ? "bg-gold text-navy"
                    : "bg-secondary text-muted hover:text-foreground"
                )}
              >
                {PRAYER_LABELS[prayer]}
                {distribution[prayer] > 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    ({distribution[prayer]}p)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() =>
            logReading.mutate({ pages: todayPages, prayers: prayersDone })
          }
          disabled={logReading.isPending}
          className="w-full bg-navy dark:bg-gold text-cream-light dark:text-navy py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {logReading.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : logReading.isSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            "Save Today's Reading"
          )}
        </button>
      </div>

      {/* Recent logs */}
      {logs && logs.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h2 className="font-semibold text-navy dark:text-cream-light mb-3">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {logs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <span className="text-sm text-muted">{log.log_date}</span>
                <span className="text-sm font-semibold text-navy dark:text-gold">
                  {log.pages_read} pages
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
