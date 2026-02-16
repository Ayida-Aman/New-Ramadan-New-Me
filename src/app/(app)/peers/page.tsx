/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRamadanInfo } from "@/lib/ramadan";
import {
  Users,
  UserPlus,
  Mail,
  Loader2,
  Check,
  X,
  Send,
  BookOpen,
  Flame,
  Target,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { invitePeerByEmail } from "./actions";

interface PeerProgress {
  totalPagesRead: number;
  totalPages: number;
  currentStreak: number;
  challengesCompleted: number;
}

function PeerProgressDisplay({ progress }: { progress: PeerProgress | null }) {
  if (!progress) {
    return (
      <div className="text-xs text-muted italic">Loading progress...</div>
    );
  }

  const quranPercent =
    progress.totalPages > 0
      ? Math.round((progress.totalPagesRead / progress.totalPages) * 100)
      : 0;

  return (
    <div className="space-y-3">
      {/* Quran progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Quran
          </span>
          <span className="text-xs font-semibold text-navy dark:text-cream-light">
            {progress.totalPagesRead}/{progress.totalPages} pages
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, quranPercent)}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5">
          <Flame
            className={cn(
              "h-3.5 w-3.5",
              progress.currentStreak > 0 ? "text-orange-500" : "text-muted"
            )}
          />
          <span className="text-xs font-medium">
            {progress.currentStreak} day streak
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium">
            {progress.challengesCompleted} challenges
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PeersPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const ramadan = getRamadanInfo();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch peer connections
  const { data: connections } = useQuery<any[]>({
    queryKey: ["peer-connections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("peer_connections")
        .select(
          `*, 
          user_profile:profiles!peer_connections_user_id_fkey(display_name, avatar_url),
          peer_profile:profiles!peer_connections_peer_id_fkey(display_name, avatar_url)`
        )
        .or(`user_id.eq.${user.id},peer_id.eq.${user.id}`)
        .eq("ramadan_year", ramadan.year);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Invite mutation
  const invitePeer = useMutation({
    mutationFn: async (email: string) => {
      setInviteStatus(null);
      const result = await invitePeerByEmail(email);
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      setInviteEmail("");
      setInviteStatus({ type: "success", message: "Invitation sent!" });
      queryClient.invalidateQueries({ queryKey: ["peer-connections"] });
    },
    onError: (error: Error) => {
      setInviteStatus({ type: "error", message: error.message });
    },
  });

  const acceptedConnections =
    connections?.filter((c) => c.status === "accepted") ?? [];
  const pendingReceived =
    connections?.filter(
      (c) => c.status === "pending" && c.peer_id === user?.id
    ) ?? [];
  const pendingSent =
    connections?.filter(
      (c) => c.status === "pending" && c.user_id === user?.id
    ) ?? [];

  // Get all accepted peer IDs
  const peerIds = acceptedConnections.map((conn: any) => {
    return conn.user_id === user?.id ? conn.peer_id : conn.user_id;
  });

  // Fetch peer progress data
  const { data: peerProgressMap } = useQuery({
    queryKey: ["peer-progress", peerIds],
    queryFn: async () => {
      if (peerIds.length === 0) return {};

      const progressMap: Record<string, PeerProgress> = {};

      // Define the expected shape of the stats returned by the RPC
      type ReadingStats = {
        total_pages_read: number;
        current_streak: number;
      };

      // Fetch reading stats for all peers
      const statsPromises = peerIds.map((peerId: string) =>
        supabase.rpc("get_user_reading_stats", {
          p_user_id: peerId,
          p_year: ramadan.year,
        } as any) as unknown as Promise<any>
      );

      // Fetch quran goals for all peers
      const { data: goals } = await supabase
        .from("quran_goals")
        .select("user_id, total_pages")
        .in("user_id", peerIds)
        .eq("ramadan_year", ramadan.year)
        .eq("is_active", true);

      // Fetch challenge completion counts
      const { data: completions } = await supabase
        .from("user_challenge_completions")
        .select("user_id")
        .in("user_id", peerIds)
        .eq("ramadan_year", ramadan.year);

      const statsResults = await Promise.all(statsPromises);

      peerIds.forEach((peerId: string, i: number) => {
        const statsData = statsResults[i]?.data;
        const stats = Array.isArray(statsData) ? statsData[0] : null;
        const goal = goals?.find((g) => g.user_id === peerId);
        const challengeCount =
          completions?.filter((c) => c.user_id === peerId).length ?? 0;

        progressMap[peerId] = {
          totalPagesRead: stats?.total_pages_read ?? 0,
          totalPages: goal?.total_pages ?? 604,
          currentStreak: stats?.current_streak ?? 0,
          challengesCompleted: challengeCount,
        };
      });

      return progressMap;
    },
    enabled: peerIds.length > 0,
  });

  // Accept/decline mutation
  const updateConnection = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "declined";
    }) => {
      const { error } = await supabase
        .from("peer_connections")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peer-connections"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          Peer Accountability
        </h1>
        <p className="text-muted mt-1">Grow together, stay accountable</p>
      </div>

      {/* Invite section */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gold" />
          Invite a Peer
        </h2>
        <p className="text-sm text-muted mb-3">
          Share this app with a friend and hold each other accountable this
          Ramadan.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@email.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <button
            onClick={() => {
              if (inviteEmail.trim()) invitePeer.mutate(inviteEmail);
            }}
            disabled={invitePeer.isPending || !inviteEmail.trim()}
            className="bg-navy dark:bg-gold text-cream-light dark:text-navy px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {invitePeer.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Invite
          </button>
        </div>
        {inviteStatus && (
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              inviteStatus.type === "success"
                ? "text-emerald-500"
                : "text-destructive"
            )}
          >
            {inviteStatus.message}
          </p>
        )}
      </div>

      {/* Pending requests */}
      {pendingReceived.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Pending Requests
          </h2>
          <div className="space-y-2">
            {pendingReceived.map((conn: any) => (
              <div
                key={conn.id}
                className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-sm font-semibold text-gold">
                    {getInitials(conn.user_profile?.display_name ?? "?")}
                  </div>
                  <span className="font-medium text-navy dark:text-cream-light">
                    {conn.user_profile?.display_name ?? "Someone"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateConnection.mutate({
                        id: conn.id,
                        status: "accepted",
                      })
                    }
                    className="p-2 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      updateConnection.mutate({
                        id: conn.id,
                        status: "declined",
                      })
                    }
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active peers */}
      {acceptedConnections.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Your Peers
          </h2>
          <div className="space-y-3">
            {acceptedConnections.map((conn: any) => {
              const isInitiator = conn.user_id === user?.id;
              const peerProfile = isInitiator
                ? conn.peer_profile
                : conn.user_profile;
              const peerId = isInitiator ? conn.peer_id : conn.user_id;
              const peerName = peerProfile?.display_name ?? "Peer";
              const progress = peerProgressMap?.[peerId] ?? null;

              return (
                <div
                  key={conn.id}
                  className="bg-card rounded-2xl border border-border/50 p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-semibold text-gold">
                      {getInitials(peerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy dark:text-cream-light">
                        {peerName}
                      </p>
                      <p className="text-xs text-muted">
                        Connected this Ramadan
                      </p>
                    </div>
                  </div>

                  {/* Peer Progress */}
                  <PeerProgressDisplay progress={progress} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        pendingSent.length === 0 && (
          <div className="text-center py-10">
            <Users className="h-10 w-10 text-gold/30 mx-auto mb-3" />
            <p className="font-medium text-navy dark:text-cream-light">
              No peers yet
            </p>
            <p className="text-sm text-muted mt-1">
              Invite a friend to start your accountability journey
            </p>
          </div>
        )
      )}
    </div>
  );
}
