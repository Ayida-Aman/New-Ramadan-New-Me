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
  Heart,
  Sparkles,
  HandHeart,
  Loader2,
  Check,
  X,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const ENCOURAGEMENTS = [
  { type: "mashaallah", label: "MashaAllah!", icon: Sparkles },
  { type: "dua", label: "Dua for you", icon: Heart },
  { type: "keep_going", label: "Keep going!", icon: HandHeart },
] as const;

export default function PeersPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const ramadan = getRamadanInfo();

  const [inviteEmail, setInviteEmail] = useState("");

  // Fetch peer connections
  const { data: connections } = useQuery({
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

  const acceptedConnections = connections?.filter((c) => c.status === "accepted") ?? [];
  const pendingReceived = connections?.filter(
    (c) => c.status === "pending" && c.peer_id === user?.id
  ) ?? [];
  const pendingSent = connections?.filter(
    (c) => c.status === "pending" && c.user_id === user?.id
  ) ?? [];

  // Accept/decline mutation
  const updateConnection = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
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

  // Send encouragement
  const sendEncouragement = useMutation({
    mutationFn: async ({
      connectionId,
      receiverId,
      type,
    }: {
      connectionId: string;
      receiverId: string;
      type: string;
    }) => {
      if (!user) throw new Error("Not auth");
      const { error } = await supabase.from("peer_encouragements").insert({
        connection_id: connectionId,
        sender_id: user.id,
        receiver_id: receiverId,
        message_type: type,
      });
      if (error) throw error;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          Peer Accountability
        </h1>
        <p className="text-muted mt-1">
          Grow together, stay accountable
        </p>
      </div>

      {/* Invite section */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-semibold text-navy dark:text-cream-light mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gold" />
          Invite a Peer
        </h2>
        <p className="text-sm text-muted mb-3">
          Share this app with a friend and hold each other accountable this Ramadan.
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
          <button className="bg-navy dark:bg-gold text-cream-light dark:text-navy px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 flex items-center gap-1.5 shrink-0">
            <Send className="h-4 w-4" />
            Invite
          </button>
        </div>
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
                      updateConnection.mutate({ id: conn.id, status: "accepted" })
                    }
                    className="p-2 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      updateConnection.mutate({ id: conn.id, status: "declined" })
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

                  {/* Encouragement buttons */}
                  <div className="flex gap-2">
                    {ENCOURAGEMENTS.map((enc) => (
                      <button
                        key={enc.type}
                        onClick={() =>
                          sendEncouragement.mutate({
                            connectionId: conn.id,
                            receiverId: peerId,
                            type: enc.type,
                          })
                        }
                        disabled={sendEncouragement.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-sm font-medium text-muted hover:text-gold hover:bg-gold/10 transition-all"
                      >
                        <enc.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{enc.label}</span>
                      </button>
                    ))}
                  </div>
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
