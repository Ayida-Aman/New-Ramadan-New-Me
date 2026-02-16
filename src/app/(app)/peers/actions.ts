"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getRamadanInfo } from "@/lib/ramadan";

export async function invitePeerByEmail(email: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Use admin client to look up user by email
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error: lookupError } = await admin.auth.admin.listUsers();

  if (lookupError) {
    return { error: "Failed to look up user" };
  }

  const peerUser = users.users.find(
    (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
  );

  if (!peerUser) {
    return { error: "No user found with that email. They need to sign up first." };
  }

  if (peerUser.id === user.id) {
    return { error: "You can't invite yourself!" };
  }

  const ramadan = getRamadanInfo();

  const { error } = await supabase.from("peer_connections").insert({
    user_id: user.id,
    peer_id: peerUser.id,
    ramadan_year: ramadan.year,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a connection with this person." };
    }
    return { error: error.message };
  }

  return { success: true };
}
