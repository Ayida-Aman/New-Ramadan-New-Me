"use client";

import Link from "next/link";
import { Moon, Bell, Settings, LogOut } from "lucide-react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const { user } = useUser();
  const router = useRouter();

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
            href="/settings"
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Bell className="h-5 w-5" />
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
