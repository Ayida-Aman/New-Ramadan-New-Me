"use client";

import { useState } from "react";
import { BookOpen, X, Minus, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function QuickLogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState(4);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();

  async function handleQuickLog() {
    if (!user || pages === 0) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Get active goal
      const { data: goal } = await supabase
        .from("quran_goals")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!goal) {
        setSaving(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      // Upsert reading log
      await supabase.from("reading_logs").upsert(
        {
          user_id: user.id,
          goal_id: goal.id,
          log_date: today,
          pages_read: pages,
        },
        { onConflict: "user_id,goal_id,log_date" }
      );

      queryClient.invalidateQueries({ queryKey: ["reading-logs"] });
      queryClient.invalidateQueries({ queryKey: ["reading-stats"] });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick log panel */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-8 right-4 z-50 bg-card rounded-2xl border border-border shadow-xl p-5 w-72 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy dark:text-cream-light">
              Quick Log
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-muted mb-3">Pages read today</p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setPages(Math.max(0, pages - 1))}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-3xl font-bold text-navy dark:text-gold w-16 text-center">
              {pages}
            </span>
            <button
              onClick={() => setPages(pages + 1)}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleQuickLog}
            disabled={saving || saved || pages === 0}
            className={cn(
              "w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              saved
                ? "bg-emerald text-white"
                : "bg-navy dark:bg-gold text-cream-light dark:text-navy hover:opacity-90"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Logged!
              </>
            ) : (
              "Log Pages"
            )}
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-28 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
          isOpen
            ? "bg-muted text-muted-foreground rotate-45"
            : "bg-gold text-navy animate-pulse-glow hover:scale-105"
        )}
        style={{
          // ensure it sits above safe-area inset on mobile
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
      </button>
    </>
  );
}
