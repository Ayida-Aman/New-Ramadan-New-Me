"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { useEffect } from "react";
import { Bell, Award, Clock, MessageSquare, Users } from "lucide-react";
import type { Notification } from "@/types/supabase";

export default function NotificationsPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [] as Notification[];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Mark all unread notifications as read when opening this page
    if (!user) return;

    (async () => {
      try {
        const { data: unread } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (unread && unread.length > 0) {
          await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", user.id] });
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [user, queryClient, supabase]);

  function iconForType(type: Notification["type"]) {
    switch (type) {
      case "badge_earned":
        return <Award className="h-5 w-5 text-gold" />;
      case "streak_reminder":
        return <Clock className="h-5 w-5 text-gold" />;
      case "peer_request":
      case "peer_accepted":
      case "peer_encouragement":
        return <Users className="h-5 w-5 text-gold" />;
      case "community_like":
      case "community_comment":
        return <MessageSquare className="h-5 w-5 text-gold" />;
      default:
        return <Bell className="h-5 w-5 text-gold" />;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
        Notifications
      </h1>

      <div className="bg-card rounded-2xl border border-border/50 p-5">
        {notifications && notifications.length > 0 ? (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  n.is_read ? "bg-secondary/40" : "bg-gold/5"
                }`}
              >
                <div className="shrink-0">{iconForType(n.type)}</div>
                <div className="flex-1">
                  <div>
                    <h3 className="font-semibold text-sm text-navy dark:text-cream-light">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted mt-1">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
