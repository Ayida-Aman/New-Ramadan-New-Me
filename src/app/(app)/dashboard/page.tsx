import { createClient } from "@/lib/supabase/server";
import { getRamadanInfo, getGreeting } from "@/lib/ramadan";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const ramadan = getRamadanInfo();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch active quran goal
  const { data: goal } = await supabase
    .from("quran_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  // Fetch today's reading log
  const today = new Date().toISOString().split("T")[0];
  const { data: todayLog } = goal
    ? await supabase
        .from("reading_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_id", goal.id)
        .eq("log_date", today)
        .maybeSingle()
    : { data: null };

  // Fetch reading stats
  const { data: stats } = await supabase.rpc("get_user_reading_stats", {
    p_user_id: user.id,
    p_year: ramadan.year,
  });

  // Fetch today's challenge
  const dayNumber = ramadan.currentDay ?? 1;
  const { data: todayChallenge } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("day_number", dayNumber)
    .maybeSingle();

  // Check if challenge completed
  const { data: challengeCompletion } = todayChallenge
    ? await supabase
        .from("user_challenge_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("challenge_id", todayChallenge.id)
        .maybeSingle()
    : { data: null };

  // Fetch current weekly theme
  const weekNumber = ramadan.weekNumber;
  const { data: weeklyTheme } = await supabase
    .from("weekly_themes")
    .select("*")
    .eq("week_number", weekNumber)
    .maybeSingle();

  // Fetch peer connection
  const { data: peerConnection } = await supabase
    .from("peer_connections")
    .select("*, peer:profiles!peer_connections_peer_id_fkey(display_name, avatar_url)")
    .or(`user_id.eq.${user.id},peer_id.eq.${user.id}`)
    .eq("status", "accepted")
    .maybeSingle();

  const greeting = getGreeting();

  return (
    <DashboardClient
      profile={profile}
      goal={goal}
      todayLog={todayLog}
      stats={stats?.[0] ?? null}
      todayChallenge={todayChallenge}
      challengeCompleted={!!challengeCompletion}
      weeklyTheme={weeklyTheme}
      peerConnection={peerConnection}
      ramadan={ramadan}
      greeting={greeting}
    />
  );
}
