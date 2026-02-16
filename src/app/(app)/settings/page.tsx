"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import {
  User,
  Moon,
  Sun,
  Save,
  Loader2,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile, Badge, UserBadge } from "@/types/supabase";

export default function SettingsPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data as Profile | null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not auth");
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Fetch badges
  const { data: badges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*");
      return (data ?? []) as Badge[];
    },
  });

  const { data: userBadges } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);
      return (data ?? []) as UserBadge[];
    },
    enabled: !!user,
  });

  const earnedBadgeIds = new Set(userBadges?.map((b) => b.badge_id) ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
        Settings
      </h1>

      {/* Profile */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gold" />
          Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
              placeholder="A short bio..."
            />
          </div>
          <button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="bg-navy dark:bg-gold text-cream-light dark:text-navy px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-4">
          Appearance
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
              theme === "light"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted"
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
              theme === "dark"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted"
            )}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>
      </div>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h2 className="font-semibold text-navy dark:text-cream-light mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-gold" />
            Badges ({earnedBadgeIds.size}/{badges.length})
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {badges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center text-center p-3 rounded-xl transition-all",
                    earned
                      ? "bg-gold/10"
                      : "bg-secondary opacity-40"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1",
                      earned ? "bg-gold/20 text-gold" : "bg-border text-muted"
                    )}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">
                    {badge.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-2">
          Account
        </h2>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
    </div>
  );
}
