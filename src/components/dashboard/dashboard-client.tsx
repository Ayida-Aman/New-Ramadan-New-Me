"use client";

import Link from "next/link";
import { ProgressRing } from "./progress-ring";
import {
  BookOpen,
  Flame,
  Target,
  Users,
  PenLine,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RamadanInfo } from "@/lib/ramadan";
import type {
  Profile,
  QuranGoal,
  ReadingLog,
  ReadingStats,
  DailyChallenge,
  WeeklyTheme,
  PeerConnection,
} from "@/types/supabase";

interface DashboardClientProps {
  profile: Profile | null;
  goal: QuranGoal | null;
  todayLog: ReadingLog | null;
  stats: ReadingStats | null;
  todayChallenge: DailyChallenge | null;
  challengeCompleted: boolean;
  weeklyTheme: WeeklyTheme | null;
  peerConnection: (PeerConnection & { peer?: { display_name: string; avatar_url: string | null } }) | null;
  ramadan: RamadanInfo;
  greeting: string;
}

export function DashboardClient({
  profile,
  goal,
  todayLog,
  stats,
  todayChallenge,
  challengeCompleted,
  weeklyTheme,
  peerConnection,
  ramadan,
  greeting,
}: DashboardClientProps) {
  const displayName = profile?.display_name || "Friend";
  const totalRead = stats?.total_pages_read ?? 0;
  const totalPages = goal?.total_pages ?? 604;
  const progress = totalPages > 0 ? Math.round((totalRead / totalPages) * 100) : 0;
  const todayPages = todayLog?.pages_read ?? 0;
  const dailyTarget = goal?.daily_target ?? 20;
  const streak = stats?.current_streak ?? 0;

  return (
    <div className="space-y-6 stagger-children">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          {greeting}, {displayName}
        </h1>
        <p className="text-muted mt-1">
          {ramadan.isActive
            ? `Day ${ramadan.currentDay} of ${ramadan.totalDays}`
            : ramadan.daysUntilStart
              ? `${ramadan.daysUntilStart} days until Ramadan`
              : "Ramadan has ended — keep the momentum!"}
        </p>
      </div>

      {/* Weekly Theme Banner */}
      {weeklyTheme && (
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${weeklyTheme.gradient_from}, ${weeklyTheme.gradient_to})`,
          }}
        >
          <div className="relative z-10">
            <div className="text-sm font-medium text-white/60">
              Week {weeklyTheme.week_number}
            </div>
            <div className="text-xl font-bold mt-0.5">{weeklyTheme.title}</div>
            <div className="text-sm text-white/80 mt-1">
              {weeklyTheme.subtitle}
            </div>
          </div>
          <Sparkles className="absolute right-4 top-4 h-8 w-8 text-white/10" />
        </div>
      )}

      {/* Quran Progress */}
      {goal ? (
        <Link
          href="/quran"
          className="block bg-card rounded-2xl border border-border/50 p-6 hover:border-gold/30 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-navy dark:text-cream-light flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold" />
                Quran Progress
              </h2>
              <p className="text-sm text-muted mt-1">
                {totalRead} of {totalPages} pages
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted group-hover:text-gold transition-colors" />
          </div>

          <div className="flex items-center gap-6">
            <ProgressRing progress={progress} size={120} strokeWidth={10}>
              <span className="text-2xl font-bold text-navy dark:text-gold">
                {progress}%
              </span>
              <span className="text-xs text-muted">complete</span>
            </ProgressRing>

            <div className="flex-1 space-y-3">
              {/* Today's reading */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Today</span>
                <span className="text-sm font-semibold">
                  {todayPages}/{dailyTarget} pages
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (todayPages / dailyTarget) * 100)}%`,
                  }}
                />
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2">
                <Flame
                  className={cn(
                    "h-4 w-4",
                    streak > 0 ? "text-orange-500" : "text-muted"
                  )}
                />
                <span className="text-sm font-medium">
                  {streak} day streak
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href="/quran"
          className="block bg-card rounded-2xl border border-border/50 border-dashed p-8 text-center hover:border-gold/50 transition-colors"
        >
          <BookOpen className="h-10 w-10 text-gold/50 mx-auto mb-3" />
          <h3 className="font-semibold text-navy dark:text-cream-light">
            Set Your Quran Goal
          </h3>
          <p className="text-sm text-muted mt-1">
            Choose 1x, 2x, or 3x completion and start tracking
          </p>
          <span className="inline-flex items-center gap-1 text-gold text-sm font-medium mt-3">
            Get Started <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {/* Today's Challenge */}
      {todayChallenge && (
        <Link
          href="/challenges"
          className="block bg-card rounded-2xl border border-border/50 p-5 hover:border-gold/30 transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                challengeCompleted
                  ? "bg-emerald/10"
                  : "bg-gold/10"
              )}
            >
              {challengeCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald" />
              ) : (
                <Target className="h-5 w-5 text-gold" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Day {todayChallenge.day_number} Challenge
                </span>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-gold transition-colors" />
              </div>
              <h3
                className={cn(
                  "font-semibold mt-0.5",
                  challengeCompleted
                    ? "text-emerald line-through"
                    : "text-navy dark:text-cream-light"
                )}
              >
                {todayChallenge.title}
              </h3>
              <p className="text-sm text-muted mt-0.5 line-clamp-1">
                {todayChallenge.description}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Peer / Reflection row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Peer */}
        <Link
          href="/peers"
          className="bg-card rounded-2xl border border-border/50 p-4 hover:border-gold/30 transition-colors"
        >
          <Users className="h-5 w-5 text-gold mb-2" />
          {peerConnection ? (
            <>
              <p className="text-sm font-semibold text-navy dark:text-cream-light truncate">
                {peerConnection.peer?.display_name ?? "Your Peer"}
              </p>
              <p className="text-xs text-muted mt-0.5">View progress</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-navy dark:text-cream-light">
                Find a Peer
              </p>
              <p className="text-xs text-muted mt-0.5">
                Get accountability
              </p>
            </>
          )}
        </Link>

        {/* Reflection */}
        <Link
          href="/journal"
          className="bg-card rounded-2xl border border-border/50 p-4 hover:border-gold/30 transition-colors"
        >
          <PenLine className="h-5 w-5 text-gold mb-2" />
          <p className="text-sm font-semibold text-navy dark:text-cream-light">
            Daily Reflection
          </p>
          <p className="text-xs text-muted mt-0.5">Write your thoughts</p>
        </Link>
      </div>
    </div>
  );
}
