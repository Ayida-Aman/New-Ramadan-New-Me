"use client";

import Link from "next/link";
import { Moon, Bell, Settings, LogOut } from "lucide-react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function AppHeader() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", false);
      return (data ?? []).length;
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const unreadCount = useMemo(() => Number(unread ?? 0), [unread]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-gold" />
          <span className="text-base font-semibold text-navy dark:text-gold hidden sm:block">
            New Ramadan New Me
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
