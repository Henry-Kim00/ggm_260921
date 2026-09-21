import type { SupabaseClient } from "@supabase/supabase-js";

export async function getWishlistedPostIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data } = await supabase.from("ggm_wishlists").select("post_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.post_id as string));
}
