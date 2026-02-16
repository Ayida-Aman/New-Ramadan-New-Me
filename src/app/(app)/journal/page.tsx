"use client";

import { useState } from "react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRamadanInfo } from "@/lib/ramadan";
import { PenLine, Save, Loader2, Calendar, Heart, Smile, Sun, Shield, Cloud, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reflection, MoodType } from "@/types/supabase";

const MOODS: { value: MoodType; label: string; icon: typeof Heart; color: string }[] = [
  { value: "grateful", label: "Grateful", icon: Heart, color: "text-pink-500" },
  { value: "peaceful", label: "Peaceful", icon: Sun, color: "text-blue-400" },
  { value: "hopeful", label: "Hopeful", icon: Smile, color: "text-amber-500" },
  { value: "determined", label: "Determined", icon: Shield, color: "text-emerald" },
  { value: "struggling", label: "Struggling", icon: Cloud, color: "text-slate-400" },
  { value: "reflective", label: "Reflective", icon: Eye, color: "text-violet-500" },
];

const PROMPTS_BY_WEEK: Record<number, string> = {
  1: "What discipline are you building today? How does it feel to start fresh?",
  2: "What spiritual insight did you gain today? Describe a moment of connection.",
  3: "How did you serve someone today? What did it teach you about yourself?",
  4: "What are you most grateful for this Ramadan? What will you carry forward?",
};

export default function JournalPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const ramadan = getRamadanInfo();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);

  const prompt = PROMPTS_BY_WEEK[ramadan.weekNumber] ?? PROMPTS_BY_WEEK[1];

  // Fetch all reflections
  const { data: reflections } = useQuery({
    queryKey: ["reflections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .eq("ramadan_year", ramadan.year)
        .order("reflection_date", { ascending: false });
      return (data ?? []) as Reflection[];
    },
    enabled: !!user,
  });

  // Check today's reflection
  const today = new Date().toISOString().split("T")[0];
  const todayReflection = reflections?.find((r) => r.reflection_date === today);

  // Initialize from existing
  useState(() => {
    if (todayReflection) {
      setContent(todayReflection.content);
      setMood(todayReflection.mood);
    }
  });

  const saveReflection = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not auth");
      const { error } = await supabase.from("reflections").upsert(
        {
          user_id: user.id,
          reflection_date: today,
          prompt,
          content,
          mood,
          ramadan_year: ramadan.year,
        },
        { onConflict: "user_id,reflection_date,ramadan_year" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          Reflection Journal
        </h1>
        <p className="text-muted mt-1">
          {ramadan.isActive
            ? `Day ${ramadan.currentDay} — Week ${ramadan.weekNumber}`
            : "Your reflections"}
        </p>
      </div>

      {/* Today's Entry */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="h-5 w-5 text-gold" />
          <h2 className="font-semibold text-navy dark:text-cream-light">
            Today&apos;s Reflection
          </h2>
        </div>

        {/* Prompt */}
        <div className="bg-gold/5 rounded-xl p-3 mb-4">
          <p className="text-sm text-foreground italic">&ldquo;{prompt}&rdquo;</p>
        </div>

        {/* Mood selector */}
        <div className="mb-4">
          <p className="text-sm text-muted mb-2">How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(mood === m.value ? null : m.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  mood === m.value
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "bg-secondary text-muted hover:text-foreground"
                )}
              >
                <m.icon className={cn("h-3.5 w-3.5", mood === m.value ? "text-gold" : m.color)} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reflection..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors resize-none"
        />

        <button
          onClick={() => saveReflection.mutate()}
          disabled={saveReflection.isPending || !content.trim()}
          className="mt-3 w-full bg-navy dark:bg-gold text-cream-light dark:text-navy py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saveReflection.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {todayReflection ? "Update" : "Save"} Reflection
            </>
          )}
        </button>
      </div>

      {/* Timeline */}
      {reflections && reflections.length > 0 && (
        <div>
          <h2 className="font-semibold text-navy dark:text-cream-light mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            Past Reflections
          </h2>
          <div className="space-y-3">
            {reflections
              .filter((r) => r.reflection_date !== today)
              .map((reflection) => {
                const moodInfo = MOODS.find((m) => m.value === reflection.mood);
                return (
                  <div
                    key={reflection.id}
                    className="bg-card rounded-xl border border-border/50 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted">
                        {reflection.reflection_date}
                      </span>
                      {moodInfo && (
                        <span className={cn("text-xs font-medium flex items-center gap-1", moodInfo.color)}>
                          <moodInfo.icon className="h-3 w-3" />
                          {moodInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">
                      {reflection.content}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
